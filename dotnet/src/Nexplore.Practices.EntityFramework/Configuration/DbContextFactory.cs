namespace Nexplore.Practices.EntityFramework.Configuration
{
    using System;
    using System.Data.Common;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Storage;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.EntityFramework.Domain.Audit;
    using Nexplore.Practices.EntityFramework.Extensions;
    using Nexplore.Practices.EntityFramework.Metadata;
    using Nexplore.Practices.EntityFramework.Validation;

    public class DbContextFactory : IDbContextFactory
    {
        private readonly Func<DbConnection, IDbContextOptionsProvider> contextOptionsProvider;
        private readonly IDbModelCreator modelCreator;
        private readonly Lazy<IEntityMetadataProvider> entityMetadataProvider;
        private readonly Lazy<IValidationProvider> validationProvider;
        private readonly Lazy<IAuditHistoryProvider> auditHistoryProvider;
        private readonly IOptions<DatabaseOptions> databaseOptions;

        public DbContextFactory(
            Func<DbConnection, IDbContextOptionsProvider> contextOptionsProvider,
            IDbModelCreator modelCreator,
            Lazy<IEntityMetadataProvider> entityMetadataProvider,
            Lazy<IValidationProvider> validationProvider,
            Lazy<IAuditHistoryProvider> auditHistoryProvider,
            IOptions<DatabaseOptions> databaseOptions)
        {
            this.contextOptionsProvider = contextOptionsProvider;
            this.modelCreator = modelCreator;
            this.entityMetadataProvider = entityMetadataProvider;
            this.validationProvider = validationProvider;
            this.auditHistoryProvider = auditHistoryProvider;
            this.databaseOptions = databaseOptions;
        }

        public DbContext Create(IDbContextTransaction existingTransaction = null)
        {
            var existingDbConnection = existingTransaction?.GetDbTransaction().Connection;

            var context = this.CreateContext(existingDbConnection);

            if (existingTransaction != null)
            {
                context.Database.UseTransaction(existingTransaction);
            }

            context.ChangeTracker.AutoDetectChangesEnabled = this.databaseOptions.Value.AutoDetectChangesEnabled;

            return context;
        }

        protected virtual DbContext CreateContext(DbConnection existingDbConnection)
        {
            return new EntityFrameworkContext(
                this.contextOptionsProvider(existingDbConnection),
                this.modelCreator,
                this.entityMetadataProvider,
                this.validationProvider,
                this.auditHistoryProvider);
        }
    }
}
