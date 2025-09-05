namespace Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test
{
    using Nexplore.Practices.Core.Query;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities;

    public interface ITestRepository : IRepository<TestEntity>
    {
        IListQueryable<TestEntity> GetAllAsListQueryable();

        IListQueryable<TestEntity> GetAllAsSyncListQueryable();
    }
}
