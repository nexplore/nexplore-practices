namespace Nexplore.Practices.Core.ChangeTracking
{
    using System;
    using System.Collections.Generic;
    using Nexplore.Practices.Core.Domain.Model;

    public interface IEntityChangeTrackingService
    {
        void CheckForChanges();

        IEnumerable<ChangedPropertyInfo> GetChangedProperties<TEntity, TId>(TEntity entity, bool detectChanges = false, bool includeOwnedReferences = false)
            where TEntity : class, IEntity<TId>;

        IEnumerable<PropertyWithChanges> GetChanges<TEntity, TId>(TEntity entity, bool detectChanges = false, bool includeOwnedReferences = false, params string[] propertyNames)
            where TEntity : class, IEntity<TId>;

        bool HasCollectionChange<TEntity, TId>(Func<TEntity, TId> foreignKey, TId parentId, bool detectChanges = false)
            where TEntity : class, IEntity<TId>;

        SaveOperation GetSaveOperation<TEntity, TId>(TEntity entity, bool detectChanges = false)
            where TEntity : class, IEntity<TId>;
    }
}
