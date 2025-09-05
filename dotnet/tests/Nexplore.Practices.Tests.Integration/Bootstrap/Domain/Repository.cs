namespace Nexplore.Practices.Tests.Integration.Bootstrap.Domain
{
    using Microsoft.EntityFrameworkCore;
    using Nexplore.Practices.EntityFramework.Domain;

    public class Repository<TEntity> : CreateReadDeleteRepositoryBase<TEntity>, IRepository<TEntity>
        where TEntity : EntityBase, new()
    {
        public Repository(DbSet<TEntity> set)
            : base(set)
        {
        }
    }
}
