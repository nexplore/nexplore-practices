namespace Nexplore.Practices.EntityFramework.Metadata
{
    using System;
    using System.Linq;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.ChangeTracking;
    using Nexplore.Practices.Core;
    using Nexplore.Practices.Core.Administration;
    using Nexplore.Practices.Core.Domain.Model;

    public class EntityMetadataProvider : IEntityMetadataProvider
    {
        private readonly IClock clock;
        private readonly IVersionInfoResolver versionInfoResolver;
        private readonly IUser user;
        private readonly ChangeTracker changeTracker;

        public EntityMetadataProvider(IClock clock, IVersionInfoResolver versionInfoResolver, IUser user, ChangeTracker changeTracker)
        {
            this.clock = clock;
            this.versionInfoResolver = versionInfoResolver;
            this.user = user;
            this.changeTracker = changeTracker;
        }

        public virtual void SetTimestampValueAsOriginalValueOnChangedEntities()
        {
            foreach (var entryToSetTimestamp in this.changeTracker.Entries<ITimestamped>().Where(this.IsModifiedOrDeleted))
            {
                this.SetTimestampValueAsOriginalValue(entryToSetTimestamp);
            }
        }

        public virtual void SetModifierMetadataOnChangedEntities()
        {
            var entriesToSetModifier = this.changeTracker.Entries<IModificationMetadata>().Where(this.IsAddedOrModified).ToArray();
            if (entriesToSetModifier.Length > 0)
            {
                var saveDate = this.clock.UtcNow;
                var userIdentifier = this.user.UserId ?? this.user.UserName;
                var version = this.versionInfoResolver.CurrentVersion;

                foreach (var entryToSetModifier in entriesToSetModifier)
                {
                    this.SetModifierMetadataProperties(entryToSetModifier, saveDate, userIdentifier, version);
                }
            }
        }

        protected virtual bool IsAddedOrModified(EntityEntry entry)
        {
            return entry.State == EntityState.Added || entry.State == EntityState.Modified ||
                   entry.References.Any(this.IsOwnedReferenceModifiedOrDeleted);
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

        protected virtual void SetModifierMetadataProperties(EntityEntry<IModificationMetadata> entry, DateTimeOffset saveDate, string userIdentifier, string version)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Property(e => e.CreatedBy).CurrentValue = userIdentifier;
                entry.Property(e => e.CreatedOn).CurrentValue = saveDate;
                entry.Property(e => e.CreatedWith).CurrentValue = version;

                entry.Property(e => e.ModifiedBy).CurrentValue = null;
                entry.Property(e => e.ModifiedOn).CurrentValue = null;
                entry.Property(e => e.ModifiedWith).CurrentValue = null;
            }
            else
            {
                entry.Property(e => e.CreatedBy).IsModified = false;
                entry.Property(e => e.CreatedOn).IsModified = false;
                entry.Property(e => e.CreatedWith).IsModified = false;

                entry.Property(e => e.ModifiedBy).CurrentValue = userIdentifier;
                entry.Property(e => e.ModifiedOn).CurrentValue = saveDate;
                entry.Property(e => e.ModifiedWith).CurrentValue = version;
            }
        }

        protected virtual void SetTimestampValueAsOriginalValue(EntityEntry<ITimestamped> entry)
        {
            entry.Property(e => e.Timestamp).OriginalValue = entry.Property(e => e.Timestamp).CurrentValue;
        }
    }
}
