namespace Nexplore.Practices.Tests.Integration.Bootstrap.Services
{
    using System.Threading.Tasks;
    using Nexplore.Practices.Core.Query;
    using Nexplore.Practices.Core.Query.Objects;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Objects;

    public interface IListResultService
    {
        Task<ListResult<TestEntityListEntry>> GetListResultWithProjection(QueryParams parameters);

        Task<ListResult<TestEntityListEntry>> GetListResultWithInMemoryMapping(QueryParams parameters);

        Task<ListResult<TestEntityListEntry>> GetSyncListResultWithProjection(QueryParams parameters);

        Task<ListResult<TestEntityListEntry>> GetSyncListResultWithInMemoryMapping(QueryParams parameters);
    }
}
