namespace Nexplore.Practices.EntityFramework
{
    using System;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;
    using Nexplore.Practices.Core.Exceptions;
    using Nexplore.Practices.EntityFramework.Configuration;
    using Nexplore.Practices.EntityFramework.Domain.Audit;
    using Nexplore.Practices.EntityFramework.Metadata;
    using Nexplore.Practices.EntityFramework.Validation;

    public class EntityFrameworkContext : DbContext
    {
        private readonly IDbContextOptionsProvider contextOptionsProvider;
        private readonly IDbModelCreator modelCreator;
        private readonly Lazy<IEntityMetadataProvider> entityMetadataProvider;
        private readonly Lazy<IValidationProvider> validationProvider;
        private readonly Lazy<IAuditHistoryProvider> auditHistoryProvider;

        public EntityFrameworkContext(
            IDbContextOptionsProvider contextOptionsProvider,
            IDbModelCreator modelCreator,
            Lazy<IEntityMetadataProvider> entityMetadataProvider,
            Lazy<IValidationProvider> validationProvider,
            Lazy<IAuditHistoryProvider> auditHistoryProvider)
        {
            this.contextOptionsProvider = contextOptionsProvider;
            this.modelCreator = modelCreator;
            this.entityMetadataProvider = entityMetadataProvider;
            this.validationProvider = validationProvider;
            this.auditHistoryProvider = auditHistoryProvider;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            this.contextOptionsProvider.OnConfiguring(optionsBuilder);
        }

        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            this.modelCreator.ConfigureConventions(configurationBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            this.modelCreator.OnModelCreating(modelBuilder);
        }

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            this.PrepareSaveChanges();

            try
            {
                return base.SaveChanges(acceptAllChangesOnSuccess);
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ConcurrencyException();
            }
        }

        public override async Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
            this.PrepareSaveChanges();

            try
            {
                return await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken).ConfigureAwait(false);
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ConcurrencyException();
            }
        }

        protected virtual void PrepareSaveChanges()
        {
            this.ChangeTracker.DetectChanges();

            this.EnrichMetadata();

            this.Validate(detectChangesOnChangeTracker: false);
        }

        protected virtual void EnrichMetadata()
        {
            this.SetModifierMetadata();
            this.SetTimestamp();

            this.PerformAudit();
        }

        protected virtual void SetModifierMetadata()
        {
            this.entityMetadataProvider.Value.SetModifierMetadataOnChangedEntities();
        }

        protected virtual void SetTimestamp()
        {
            this.entityMetadataProvider.Value.SetTimestampValueAsOriginalValueOnChangedEntities();
        }

        protected virtual void PerformAudit()
        {
            this.auditHistoryProvider.Value.CreateAuditHistory();
        }

        protected virtual void Validate(bool detectChangesOnChangeTracker)
        {
            var validationResults = this.validationProvider.Value.Validate(detectChangesOnChangeTracker).ToArray();
            if (validationResults.Length != 0)
            {
                throw new EntityValidationException(validationResults);
            }
        }
    }
}
