namespace Nexplore.Practices.EntityFramework.Configuration
{
    using System;
    using System.Diagnostics.CodeAnalysis;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    using Microsoft.EntityFrameworkCore.Migrations;
    using Microsoft.EntityFrameworkCore.SqlServer.Migrations.Internal;
    using Nexplore.Practices.EntityFramework.Domain;

    [SuppressMessage("Microsoft.EntityFrameworkCore.Analyzers", "EF1001:Internal EF Core API usage", Justification = "Reviewed.")]
    public class MigrationHistoryRepository : SqlServerHistoryRepository
    {
        public MigrationHistoryRepository(HistoryRepositoryDependencies dependencies)
            : base(dependencies)
        {
        }

        protected override void ConfigureTable(EntityTypeBuilder<HistoryRow> history)
        {
            base.ConfigureTable(history);

            history.Property<DateTimeOffset?>(nameof(GeneratorsHistoryRow.GeneratorsApplied));
        }
    }
}
