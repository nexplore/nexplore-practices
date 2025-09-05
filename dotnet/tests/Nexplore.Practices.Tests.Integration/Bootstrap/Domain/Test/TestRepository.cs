namespace Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test
{
    using System.Linq;
    using Microsoft.EntityFrameworkCore;
    using Nexplore.Practices.Core.Query;
    using Nexplore.Practices.EntityFramework.Query;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities;

    public class TestRepository : Repository<TestEntity>, ITestRepository
    {
        public TestRepository(DbSet<TestEntity> set)
            : base(set)
        {
        }

        public IListQueryable<TestEntity> GetAllAsListQueryable()
        {
            return this.GetQuery().AsListQueryable();
        }

        public IListQueryable<TestEntity> GetAllAsSyncListQueryable()
        {
            return this.GetQuery().AsEnumerable().AsQueryable().AsSyncListQueryable();
        }
    }
}
