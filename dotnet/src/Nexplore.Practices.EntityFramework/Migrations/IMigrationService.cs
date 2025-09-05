namespace Nexplore.Practices.EntityFramework.Migrations
{
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore.Infrastructure;

    public interface IMigrationService
    {
        Task MigrateToLatestVersionAsync(DatabaseFacade database, bool executeDataSeeding = true, bool dropTables = false, CancellationToken cancellationToken = default);
    }
}
