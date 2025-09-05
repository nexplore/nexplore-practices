namespace Nexplore.Practices.Tests.Integration.Bootstrap.Domain
{
    using Nexplore.Practices.Core.Domain;

    public interface IRepository<TEntity> : IReadRepository<TEntity>, ICreateDeleteRepository<TEntity>
        where TEntity : EntityBase
    {
    }
}
