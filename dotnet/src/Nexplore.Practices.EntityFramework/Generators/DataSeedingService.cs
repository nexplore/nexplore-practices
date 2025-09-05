namespace Nexplore.Practices.EntityFramework.Generators
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Reflection;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Migrations;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core;
    using Nexplore.Practices.Core.Generators;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.EntityFramework.Configuration;
    using Nexplore.Practices.EntityFramework.Domain;

    public class DataSeedingService : IDataSeedingService
    {
        private readonly IUnitOfWorkFactory<DbSet<GeneratorsHistoryRow>> migrationHistoryUnitOfWorkFactory;
        private readonly IUnitOfWorkFactory<IGeneratorRunner> generatorRunnerUnitOfWorkFactory;
        private readonly IOptions<DatabaseOptions> options;
        private readonly ILogger<DataSeedingService> logger;
        private readonly IClock clock;

        public DataSeedingService(IUnitOfWorkFactory<DbSet<GeneratorsHistoryRow>> migrationHistoryUnitOfWorkFactory, IUnitOfWorkFactory<IGeneratorRunner> generatorRunnerUnitOfWorkFactory, IOptions<DatabaseOptions> options, ILogger<DataSeedingService> logger, IClock clock)
        {
            this.migrationHistoryUnitOfWorkFactory = migrationHistoryUnitOfWorkFactory;
            this.generatorRunnerUnitOfWorkFactory = generatorRunnerUnitOfWorkFactory;
            this.options = options;
            this.logger = logger;
            this.clock = clock;
        }

        public async Task ExecuteAsync(CancellationToken cancellationToken)
        {
            using (var migrationHistoryUnit = this.migrationHistoryUnitOfWorkFactory.Begin())
            {
                var migrationsToApply = migrationHistoryUnit.Dependent.Where(e => e.GeneratorsApplied == null).ToArray();
                if (migrationsToApply.Length != 0)
                {
                    this.logger.LogInformation($"Seed data for migrations: {string.Join(", ", migrationsToApply.Select(e => e.MigrationId))}");

                    var generators = this.FindGeneratorsToRun(migrationsToApply).ToArray();
                    if (generators.Length != 0)
                    {
                        using (var generatorRunnerUnit = this.generatorRunnerUnitOfWorkFactory.Begin())
                        {
                            await generatorRunnerUnit.Dependent.RunGeneratorsAsync(generators, cancellationToken).ConfigureAwait(false);
                        }
                    }

                    var now = this.clock.Now;
                    foreach (var migrationToApply in migrationsToApply)
                    {
                        migrationToApply.GeneratorsApplied = now;
                    }

                    await migrationHistoryUnit.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
                }
            }
        }

        protected virtual IEnumerable<Type> FindGeneratorsToRun(GeneratorsHistoryRow[] migrationsToApply)
        {
            var assembly = AppDomain.CurrentDomain.GetAssemblies().Single(a => a.GetName().Name == this.options.Value.MigrationAssembly);
            var migrationTypes = assembly.GetTypes().Where(t => t.BaseType == typeof(Migration)).ToArray();
            foreach (var migration in migrationsToApply)
            {
                var migrationType = migrationTypes.FirstOrDefault(t => migration.MigrationId.EndsWith("_" + t.Name, StringComparison.InvariantCulture));
                if (migrationType != null)
                {
                    foreach (var attribute in migrationType.GetCustomAttributes<GeneratorDependencyAttribute>())
                    {
                        yield return attribute.GeneratorType;
                    }
                }
            }
        }
    }
}
