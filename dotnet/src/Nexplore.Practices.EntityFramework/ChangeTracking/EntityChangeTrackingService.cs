namespace Nexplore.Practices.EntityFramework.ChangeTracking
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.ChangeTracking;
    using Nexplore.Practices.Core.ChangeTracking;
    using Nexplore.Practices.Core.Domain.Model;
    using Nexplore.Practices.EntityFramework.Extensions;

    public class EntityChangeTrackingService : IEntityChangeTrackingService
    {
        private readonly ChangeTracker changeTracker;

        public EntityChangeTrackingService(ChangeTracker changeTracker)
        {
            this.changeTracker = changeTracker;
        }

        public void CheckForChanges()
        {
            this.changeTracker.DetectChanges();
        }

        public IEnumerable<ChangedPropertyInfo> GetChangedProperties<TEntity, TId>(TEntity entity, bool detectChanges = false, bool includeOwnedReferences = false)
            where TEntity : class, IEntity<TId>
        {
            if (detectChanges)
            {
                this.CheckForChanges();
            }

            var entry = this.changeTracker.Entries<TEntity>().SingleOrDefault(e => e.Entity.Id.Equals(entity.Id));

            if (!IsModified(entry, includeOwnedReferences))
            {
                // Only return anything if entry is modified. If the state was added or deleted we would have to return everything.
                yield break;
            }

            foreach (var changedPropertyInfo in CreateChangedPropertyInfos(null, entry))
            {
                yield return changedPropertyInfo;
            }

            if (includeOwnedReferences)
            {
                foreach (var changedPropertyInfo in GetChangedOwnedReferenceProperties(null, entry))
                {
                    yield return changedPropertyInfo;
                }
            }
        }

        public IEnumerable<PropertyWithChanges> GetChanges<TEntity, TId>(TEntity entity, bool detectChanges = false, bool includeOwnedReferences = false, params string[] propertyNames)
            where TEntity : class, IEntity<TId>
        {
            if (propertyNames == null || propertyNames.Length == 0)
            {
                yield break;
            }

            if (detectChanges)
            {
                this.CheckForChanges();
            }

            var entry = this.changeTracker.Entries<TEntity>().SingleOrDefault(e => e.Entity.Id.Equals(entity.Id));

            if (!IsModified(entry, includeOwnedReferences))
            {
                // Only return anything if entry is modified. If the state was added or deleted we would have to return everything.
                yield break;
            }

            foreach (var propertyWithChanges in CreatePropertiesWithChanges(null, propertyNames, entry))
            {
                yield return propertyWithChanges;
            }

            if (includeOwnedReferences)
            {
                foreach (var propertyWithChanges in GetOwnedReferencePropertyChanges(null, propertyNames, entry))
                {
                    yield return propertyWithChanges;
                }
            }
        }

        public bool HasCollectionChange<TEntity, TId>(Func<TEntity, TId> foreignKey, TId parentId, bool detectChanges = false)
            where TEntity : class, IEntity<TId>
        {
            if (detectChanges)
            {
                this.CheckForChanges();
            }

            return this.changeTracker.Entries<TEntity>().Any(e => (e.State == EntityState.Added || e.State == EntityState.Deleted) && foreignKey(e.Entity).Equals(parentId));
        }

        public SaveOperation GetSaveOperation<TEntity, TId>(TEntity entity, bool detectChanges = false)
            where TEntity : class, IEntity<TId>
        {
            if (detectChanges)
            {
                this.CheckForChanges();
            }

            var entry = this.changeTracker.Entries<TEntity>().SingleOrDefault(e => e.Entity.Id.Equals(entity.Id));

            if (entry != null)
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        return SaveOperation.Add;
                    case EntityState.Modified:
                        return SaveOperation.Update;
                    case EntityState.Deleted:
                        return SaveOperation.Remove;
                }
            }

            return SaveOperation.Undefined;
        }

        private static bool IsModified(EntityEntry entry, bool includeOwnedReferences)
        {
            return entry.State is EntityState.Modified || (includeOwnedReferences && entry.References.Any(IsOwnedReferenceModified));
        }

        private static bool IsOwnedReferenceModified(ReferenceEntry entry)
        {
            return entry.TargetEntry != null &&
                   entry.TargetEntry.Metadata.IsOwned() &&
                   IsModified(entry.TargetEntry, true);
        }

        private static IEnumerable<ChangedPropertyInfo> GetChangedOwnedReferenceProperties(string parentPath, EntityEntry entry)
        {
            foreach (var reference in entry.References.Where(r => r.TargetEntry != null && r.TargetEntry.Metadata.IsOwned()))
            {
                var path = parentPath.ConcatPropertyPath(reference.Metadata.PropertyInfo?.Name);
                foreach (var changedPropertyInfo in CreateChangedPropertyInfos(path, reference.TargetEntry))
                {
                    yield return changedPropertyInfo;
                }

                foreach (var changedPropertyInfo in GetChangedOwnedReferenceProperties(path, reference.TargetEntry))
                {
                    yield return changedPropertyInfo;
                }
            }
        }

        private static IEnumerable<ChangedPropertyInfo> CreateChangedPropertyInfos(string parentPath, EntityEntry entry)
        {
            foreach (var property in entry.Members.Where(p => p.IsModified))
            {
                yield return new ChangedPropertyInfo
                {
                    PropertyName = parentPath.ConcatPropertyPath(property.Metadata.Name),
                    PropertyFullName = $"{property.Metadata.PropertyInfo?.DeclaringType}.{property.Metadata.PropertyInfo?.Name}",
                    PropertyInfo = property.Metadata.PropertyInfo,
                };
            }
        }

        private static IEnumerable<PropertyWithChanges> GetOwnedReferencePropertyChanges(string parentPath, string[] propertyNames, EntityEntry entry)
        {
            foreach (var reference in entry.References.Where(r => r.TargetEntry != null && r.TargetEntry.Metadata.IsOwned()))
            {
                var path = parentPath.ConcatPropertyPath(reference.Metadata.PropertyInfo?.Name);
                foreach (var propertyWithChanges in CreatePropertiesWithChanges(path, propertyNames, reference.TargetEntry))
                {
                    yield return propertyWithChanges;
                }

                foreach (var propertyWithChanges in GetOwnedReferencePropertyChanges(path, propertyNames, reference.TargetEntry))
                {
                    yield return propertyWithChanges;
                }
            }
        }

        private static IEnumerable<PropertyWithChanges> CreatePropertiesWithChanges(string parentPath, string[] propertyNames, EntityEntry entry)
        {
            foreach (var property in entry.Properties.Where(p => p.IsModified))
            {
                var propertyPath = parentPath.ConcatPropertyPath(property.Metadata.Name);

                if (propertyNames.Contains(propertyPath))
                {
                    yield return new PropertyWithChanges
                    {
                        PropertyName = propertyPath,
                        OldValue = property.OriginalValue,
                        NewValue = property.CurrentValue,
                    };
                }
            }
        }
    }
}
