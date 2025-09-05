namespace Nexplore.Practices.EntityFramework.Migrations
{
    using System.IO;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Data.SqlClient;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Infrastructure;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.EntityFramework.Configuration;
    using Nexplore.Practices.EntityFramework.Generators;

    public class MigrationService : IMigrationService
    {
        private readonly IDataSeedingService dataSeedingService;
        private readonly IOptions<DatabaseOptions> options;
        private readonly ILogger<MigrationService> logger;

        public MigrationService(IDataSeedingService dataSeedingService, IOptions<DatabaseOptions> options, ILogger<MigrationService> logger)
        {
            this.dataSeedingService = dataSeedingService;
            this.options = options;
            this.logger = logger;
        }

        public async Task MigrateToLatestVersionAsync(DatabaseFacade database, bool executeDataSeeding, bool dropTables, CancellationToken cancellationToken)
        {
            if (dropTables)
            {
                await this.DropTablesAsync(database, cancellationToken).ConfigureAwait(false);
            }

            await this.RunMigrationsAsync(database, cancellationToken).ConfigureAwait(false);

            if (executeDataSeeding)
            {
                await this.RunDataSeedingAsync(cancellationToken).ConfigureAwait(false);
            }
        }

        private async Task DropTablesAsync(DatabaseFacade database, CancellationToken cancellationToken)
        {
            this.logger.LogInformation("Drop all database tables before migration");

            using (var scriptReader = new StreamReader(GetDropTablesScript()))
            using (var sqlConnection = new SqlConnection(database.GetConnectionString()))
            {
                sqlConnection.Open();

                var script = await scriptReader.ReadToEndAsync(cancellationToken).ConfigureAwait(false);
                using (var cmd = new SqlCommand(script, sqlConnection))
                {
                    await cmd.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
                }
            }
        }

        private async Task RunMigrationsAsync(DatabaseFacade database, CancellationToken cancellationToken)
        {
            var pendingMigrations = (await database.GetPendingMigrationsAsync(cancellationToken).ConfigureAwait(false)).ToArray();
            if (pendingMigrations.Length != 0)
            {
                this.logger.LogInformation($"Pending migrations: {string.Join(", ", pendingMigrations)}");

                database.SetCommandTimeout(this.options.Value.MigrationCommandTimeoutInSeconds);

                await database.MigrateAsync(cancellationToken).ConfigureAwait(false);
            }
        }

        private async Task RunDataSeedingAsync(CancellationToken cancellationToken)
        {
            await this.dataSeedingService.ExecuteAsync(cancellationToken).ConfigureAwait(false);
        }

        private static Stream GetDropTablesScript()
        {
            return typeof(MigrationService).Assembly.GetManifestResourceStream(typeof(MigrationService).Namespace + ".CleanupScript.sql");
        }
    }
}
