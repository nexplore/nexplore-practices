namespace Nexplore.Practices.Core.Domain
{
    using System.Collections.Generic;

    public interface ICreateDeleteRepository<TEntity>
        where TEntity : class
    {
        TEntity Create();

        void Add(TEntity entity);

        TEntity CreateAndAdd();

        void Remove(TEntity entity);

        void RemoveRange(IEnumerable<TEntity> entities);
    }
}
