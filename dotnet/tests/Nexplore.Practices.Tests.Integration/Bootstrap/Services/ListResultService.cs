namespace Nexplore.Practices.Tests.Integration.Bootstrap.Services
{
    using System.Linq;
    using System.Threading.Tasks;
    using Nexplore.Practices.Core.Query;
    using Nexplore.Practices.Core.Query.Objects;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Objects;

    public class ListResultService : IListResultService
    {
        private readonly ITestRepository testRepository;

        public ListResultService(ITestRepository testRepository)
        {
            this.testRepository = testRepository;
        }

        public Task<ListResult<TestEntityListEntry>> GetListResultWithProjection(QueryParams parameters)
        {
            return this.testRepository.GetAllAsListQueryable()
                .ProjectTo(new TestEntityQueryableProjector())
                .ToListResultAsync(parameters);
        }

        public Task<ListResult<TestEntityListEntry>> GetListResultWithInMemoryMapping(QueryParams parameters)
        {
            return this.testRepository.GetAllAsListQueryable().ToListResultAsync(parameters, MapToListEntityListEntry);
        }

        public Task<ListResult<TestEntityListEntry>> GetSyncListResultWithProjection(QueryParams parameters)
        {
            return this.testRepository.GetAllAsSyncListQueryable()
                .ProjectTo(new TestEntityQueryableProjector())
                .ToListResultAsync(parameters);
        }

        public Task<ListResult<TestEntityListEntry>> GetSyncListResultWithInMemoryMapping(QueryParams parameters)
        {
            return this.testRepository.GetAllAsSyncListQueryable().ToListResultAsync(parameters, MapToListEntityListEntry);
        }

        private static TestEntityListEntry MapToListEntityListEntry(TestEntity entity)
        {
            return new TestEntityListEntry
            {
                FirstName = $"{entity.FirstName} Mapped",
                LastName = $"{entity.LastName} Mapped",
            };
        }

        private sealed class TestEntityQueryableProjector : IQueryableProjector<TestEntity, TestEntityListEntry>
        {
            public IQueryable<TestEntityListEntry> ProjectTo(IQueryable<TestEntity> source)
            {
                return source.Select(t => new TestEntityListEntry { FirstName = t.FirstName, LastName = t.LastName });
            }
        }
    }
}
