namespace Nexplore.Practices.EntityFramework.Configuration
{
    public class DatabaseOptions
    {
        public const string NAME = "Database";

        public string ConnectionString { get; set; }

        public string[] MappingConfigurationAssemblies { get; set; }

        public string MigrationAssembly { get; set; }

        public string MigrationHistoryTable { get; set; } = "__MigrationsHistory";

        public string MigrationHistorySchema { get; set; } = "dbo";

        public int MigrationCommandTimeoutInSeconds { get; set; } = 6 * 60;

        public bool ExecuteTestDataGenerators { get; set; }

        public bool ExecuteSampleDataGenerators { get; set; }

        public string DataProtectionEncryptionPassword { get; set; }

        public bool AutoDetectChangesEnabled { get; set; } = true;
    }
}