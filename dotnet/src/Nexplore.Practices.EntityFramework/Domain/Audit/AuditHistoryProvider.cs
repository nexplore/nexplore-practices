namespace Nexplore.Practices.EntityFramework.Domain.Audit
{
    using System;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.Linq;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.ChangeTracking;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core;
    using Nexplore.Practices.Core.Administration;
    using Nexplore.Practices.Core.ChangeTracking;
    using Nexplore.Practices.Core.Domain.Model.Audit;
    using Nexplore.Practices.Core.Domain.Model.Audit.Entities;
    using Nexplore.Practices.EntityFramework.Configuration;
    using Nexplore.Practices.EntityFramework.Extensions;

    public class AuditHistoryProvider : IAuditHistoryProvider
    {
        private static readonly Type[] defaultExcludedTypes = { typeof(AuditHistory) };

        private readonly IClock clock;
        private readonly ILogger<AuditHistoryProvider> logger;
        private readonly Func<IAuditHistoryRepository> auditHistoryRepository;
        private readonly IUser user;
        private readonly ChangeTracker changeTracker;
        private readonly IVersionInfoResolver versionInfoResolver;
        private readonly IOptions<AuditOptions> auditOptions;

        private readonly IReadOnlyCollection<string> excludedProperties;
        private readonly IReadOnlyCollection<Type> excludedTypes;

        public AuditHistoryProvider(IClock clock, ILogger<AuditHistoryProvider> logger, Func<IAuditHistoryRepository> auditHistoryRepository, IUser user, ChangeTracker changeTracker, IVersionInfoResolver versionInfoResolver, IOptions<AuditOptions> auditOptions)
        {
            this.clock = clock;
            this.logger = logger;
            this.auditHistoryRepository = auditHistoryRepository;
            this.user = user;
            this.changeTracker = changeTracker;
            this.versionInfoResolver = versionInfoResolver;
            this.auditOptions = auditOptions;

            this.excludedProperties = new ReadOnlyCollection<string>(auditOptions.Value.ExcludedProperties.Where(p => !string.IsNullOrWhiteSpace(p)).ToArray());
            this.excludedTypes = new ReadOnlyCollection<Type>(defaultExcludedTypes.Union(auditOptions.Value.ExcludedTypes.Select(Type.GetType)).Where(t => t != null).ToArray());
        }

        public void CreateAuditHistory()
        {
            try
            {
                if (!this.auditOptions.Value.Enabled)
                {
                    return;
                }

                var auditHistoryEntries = new List<AuditHistory>();
                var changedEntities = this.changeTracker.Entries<IAuditable>();
                var modifiedDbEntries = this.GetAuditableEntities(changedEntities);

                foreach (var dbEntityEntry in modifiedDbEntries)
                {
                    this.AddAuditEntries(dbEntityEntry, dbEntityEntry, path: null, deletedInHierarchy: false, auditHistoryEntries);
                }

                this.SaveAuditHistory(auditHistoryEntries);
            }
            catch (Exception ex)
            {
                this.logger.LogWarning(ex, "AuditHistory preparation failed");
            }
        }

        protected virtual IEnumerable<EntityEntry<IAuditable>> GetAuditableEntities(IEnumerable<EntityEntry<IAuditable>> changedEntities)
        {
            return changedEntities
                .Where(this.IsModifiedOrDeleted)
                .Where(this.IsTypeIncluded)
                .ToArray();
        }

        protected virtual bool IsTypeIncluded(EntityEntry entry)
        {
            var type = entry.Entity.GetType();

            return !this.excludedTypes.Any(t => t.IsAssignableFrom(type));
        }

        protected virtual bool IsModifiedOrDeleted(EntityEntry entry)
        {
            return entry.State is EntityState.Modified or EntityState.Deleted || entry.References.Any(this.IsOwnedReferenceModifiedOrDeleted);
        }

        protected virtual bool IsOwnedReferenceModifiedOrDeleted(ReferenceEntry entry)
        {
            return entry.TargetEntry != null &&
                   entry.TargetEntry.Metadata.IsOwned() &&
                   this.IsModifiedOrDeleted(entry.TargetEntry);
        }

        protected virtual void AddAuditEntries(EntityEntry<IAuditable> ownerEntity, EntityEntry dbEntityEntry, string path, bool deletedInHierarchy, List<AuditHistory> auditHistoryEntries)
        {
            var isDeletedInHierarchyOrDeletedItself = deletedInHierarchy || dbEntityEntry.State == EntityState.Deleted;

            if (isDeletedInHierarchyOrDeletedItself)
            {
                auditHistoryEntries.AddRange(this.CreateHistoryEntriesForDeletedEntry(path, ownerEntity, dbEntityEntry));
            }
            else if (dbEntityEntry.State is EntityState.Modified)
            {
                auditHistoryEntries.AddRange(this.CreateHistoryEntriesForModifiedEntry(path, ownerEntity, dbEntityEntry));
            }

            var ownedReferences = this.GetOwnedReferences(dbEntityEntry);
            foreach (var reference in ownedReferences)
            {
                this.AddAuditEntries(ownerEntity, reference.Item1, path.ConcatPropertyPath(reference.Item2), isDeletedInHierarchyOrDeletedItself, auditHistoryEntries);
            }
        }

        protected virtual IEnumerable<AuditHistory> CreateHistoryEntriesForModifiedEntry(string path, EntityEntry<IAuditable> ownerEntity, EntityEntry dbEntityEntry)
        {
            var propertyNames = dbEntityEntry.CurrentValues.Properties.Select(p => p.Name).Except(this.excludedProperties).ToArray();

            foreach (var propertyName in propertyNames)
            {
                var dbPropertyEntry = dbEntityEntry.Property(propertyName);
                if (dbPropertyEntry.IsModified && !Equals(dbPropertyEntry.CurrentValue, dbPropertyEntry.OriginalValue))
                {
                    yield return this.CreateHistoryEntity(path, dbPropertyEntry, ownerEntity, SaveOperation.Update);
                }
            }
        }

        protected virtual IEnumerable<AuditHistory> CreateHistoryEntriesForDeletedEntry(string path, EntityEntry<IAuditable> ownerEntity, EntityEntry dbEntityEntry)
        {
            var propertyNames = dbEntityEntry.OriginalValues.Properties.Select(p => p.Name).Except(this.excludedProperties).ToArray();

            foreach (var propertyName in propertyNames)
            {
                var dbPropertyEntry = dbEntityEntry.Property(propertyName);
                yield return this.CreateHistoryEntity(path, dbPropertyEntry, ownerEntity, SaveOperation.Remove);
            }
        }

        protected virtual IEnumerable<Tuple<EntityEntry, string>> GetOwnedReferences(EntityEntry entry)
        {
            return entry.References.Where(r => r.TargetEntry != null && r.TargetEntry.Metadata.IsOwned()).Select(r => Tuple.Create(r.TargetEntry, r.Metadata.Name));
        }

        protected virtual AuditHistory CreateHistoryEntity(string path, PropertyEntry dbPropertyEntry, EntityEntry<IAuditable> dbEntityEntry, SaveOperation operation)
        {
            var history = new AuditHistory
            {
                EntityType = dbEntityEntry.Metadata.ClrType.ToString(),
                EntityId = dbEntityEntry.Entity.GetAuditKey(),
                PropertyType = dbPropertyEntry.Metadata.ClrType.ToString(),
                PropertyName = path.ConcatPropertyPath(dbPropertyEntry.Metadata.Name),
                ModificationType = operation.ToString(),
            };

            var originalValue = dbPropertyEntry.OriginalValue;
            var newValue = dbPropertyEntry.CurrentValue;

            if (originalValue != null)
            {
                history.OldValue = originalValue.ToString();
            }

            if (newValue != null && operation != SaveOperation.Remove)
            {
                history.NewValue = newValue.ToString();
            }

            return history;
        }

        protected virtual void SaveAuditHistory(IEnumerable<AuditHistory> auditHistoryEntries)
        {
            var now = this.clock.UtcNow;
            var username = this.user.UserId ?? this.user.UserName;
            var version = this.versionInfoResolver.CurrentVersion;

            var repository = this.auditHistoryRepository();
            foreach (var auditHistoryEntry in auditHistoryEntries)
            {
                auditHistoryEntry.CreatedOn = now;
                auditHistoryEntry.CreatedBy = username;
                auditHistoryEntry.CreatedWith = version;
                repository.Add(auditHistoryEntry);
            }
        }
    }
}
