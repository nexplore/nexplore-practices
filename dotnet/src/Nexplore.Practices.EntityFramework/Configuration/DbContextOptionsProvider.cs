namespace Nexplore.Practices.EntityFramework.Configuration
{
    using System.Data.Common;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Infrastructure;
    using Microsoft.EntityFrameworkCore.Migrations;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;

    public class DbContextOptionsProvider : IDbContextOptionsProvider
    {
        private readonly IOptions<DatabaseOptions> options;
        private readonly ILoggerFactory loggerFactory;
        private readonly DbConnection existingDbConnection;

        public DbContextOptionsProvider(IOptions<DatabaseOptions> options, ILoggerFactory loggerFactory, DbConnection existingDbConnection = null)
        {
            this.options = options;
            this.loggerFactory = loggerFactory;
            this.existingDbConnection = existingDbConnection;
        }

        public virtual void OnConfiguring(DbContextOptionsBuilder builder)
        {
            this.ConfigureDatabaseServer(builder);

            this.ConfigureServices(builder);

            this.ConfigureNavigationPropertiesProxies(builder);

            this.ConfigureTrackingBehavior(builder);

            this.ConfigureLogging(builder);

            this.ConfigureInterceptors(builder);
        }

        protected virtual void ConfigureDatabaseServer(DbContextOptionsBuilder builder)
        {
            if (this.existingDbConnection != null)
            {
                builder.UseSqlServer(this.existingDbConnection, this.ConfigureSqlServer);
            }
            else
            {
                builder.UseSqlServer(this.options.Value.ConnectionString, this.ConfigureSqlServer);
            }
        }

        protected virtual void ConfigureSqlServer(SqlServerDbContextOptionsBuilder builder)
        {
            var historyTable = this.options.Value.MigrationHistoryTable;
            var historySchema = this.options.Value.MigrationHistorySchema;

            builder.MigrationsHistoryTable(historyTable, historySchema);

            builder.MigrationsAssembly(this.options.Value.MigrationAssembly);
        }

        protected virtual void ConfigureInterceptors(DbContextOptionsBuilder builder)
        {
        }

        protected virtual void ConfigureServices(DbContextOptionsBuilder builder)
        {
            // Add column to check if generators have been applied to migration history table
            builder.ReplaceService<IHistoryRepository, MigrationHistoryRepository>();
        }

        protected virtual void ConfigureNavigationPropertiesProxies(DbContextOptionsBuilder builder)
        {
            builder.UseLazyLoadingProxies();
        }

        protected virtual void ConfigureTrackingBehavior(DbContextOptionsBuilder builder)
        {
            // Set query tracking to be enabled (although it is actually default)
            builder.UseQueryTrackingBehavior(QueryTrackingBehavior.TrackAll);
        }

        protected virtual void ConfigureLogging(DbContextOptionsBuilder builder)
        {
            builder.UseLoggerFactory(this.loggerFactory);
        }
    }
}
