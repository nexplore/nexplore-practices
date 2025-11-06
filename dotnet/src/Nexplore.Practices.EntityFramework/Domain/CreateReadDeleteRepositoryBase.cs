namespace Nexplore.Practices.EntityFramework.Domain
{
    using System.Collections.Generic;
    using Microsoft.EntityFrameworkCore;
    using Nexplore.Practices.Core.Domain;

    public abstract class CreateReadDeleteRepositoryBase<TEntity> : ReadRepositoryBase<TEntity>, ICreateDeleteRepository<TEntity>
        where TEntity : class
    {
        protected CreateReadDeleteRepositoryBase(DbSet<TEntity> set)
            : base(set)
        {
        }

        public virtual TEntity Create()
        {
            return this.GetSet().CreateProxy();
        }

        public virtual void Add(TEntity entity)
        {
            this.GetSet().Add(entity);
        }

        public virtual TEntity CreateAndAdd()
        {
            var entity = this.Create();
            this.Add(entity);
            return entity;
        }

        public virtual void Remove(TEntity entity)
        {
            this.GetSet().Remove(entity);
        }

        public virtual void RemoveRange(IEnumerable<TEntity> entities)
        {
            this.GetSet().RemoveRange(entities);
        }
    }
}
