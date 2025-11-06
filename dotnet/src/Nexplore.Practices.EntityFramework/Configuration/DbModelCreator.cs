namespace Nexplore.Practices.EntityFramework.Configuration
{
    using System.Linq;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.EntityFramework.Conventions;
    using Nexplore.Practices.EntityFramework.Domain;
    using Nexplore.Practices.EntityFramework.Extensions;
    using Nexplore.Practices.EntityFramework.Mapping;

    public class DbModelCreator : IDbModelCreator
    {
        private readonly IOptions<DatabaseOptions> options;
        private readonly IOptions<AuditOptions> auditOptions;

        public DbModelCreator(IOptions<DatabaseOptions> options, IOptions<AuditOptions> auditOptions)
        {
            this.options = options;
            this.auditOptions = auditOptions;
        }

        public virtual void ConfigureConventions(ModelConfigurationBuilder builder)
        {
        }

        public virtual void OnModelCreating(ModelBuilder builder)
        {
            this.ConfigureFromOptions(builder);

            this.ConfigureFromAssemblies(builder);

            this.ConfigureDefaultSchema(builder);

            this.ConfigureTableEntityTypes(builder);

            this.ConfigureMigrationHistory(builder);
        }

        protected virtual void ConfigureFromOptions(ModelBuilder builder)
        {
            if (this.auditOptions.Value.Enabled)
            {
                builder.ApplyConfiguration(new AuditHistoryMapping());
            }
        }

        protected virtual void ConfigureFromAssemblies(ModelBuilder builder)
        {
            builder.ApplyConfigurationsFromAssemblies(this.options.Value.MappingConfigurationAssemblies);
        }

        protected virtual void ConfigureDefaultSchema(ModelBuilder builder)
        {
            builder.ApplyDefaultSchema(this.GetDefaultSchema());
        }

        protected virtual string GetDefaultSchema()
        {
            return EntityExtensions.DEFAULT_ENTITIES_SCHEMA;
        }

        protected virtual void ConfigureTableEntityTypes(ModelBuilder builder)
        {
            var tableEntityTypes = builder.Model.GetEntityTypes().Where(this.IsTableEntityType);
            foreach (var tableEntityType in tableEntityTypes)
            {
                this.ConfigureTableEntityType(builder, tableEntityType);
            }
        }

        protected virtual bool IsTableEntityType(IMutableEntityType entityType)
        {
            return entityType.IsOwned() == false // Not an owned type
                   && !entityType.IsPropertyBag // Not the EF property bag
                   && entityType.BaseType == null // Root of TPH mapping hierarchy
                   && string.IsNullOrWhiteSpace(entityType.GetViewName()); // Not mapped to a view
        }

        protected virtual void ConfigureTableEntityType(ModelBuilder builder, IMutableEntityType entityType)
        {
            // Only reconfigure entities which are not already configured with a specific schema
            if (entityType.GetSchema() == this.GetDefaultSchema())
            {
                builder.Entity(entityType.ClrType).ToTableByConvention(this.OmitBaseIdentifierInTableNames(), this.GetEntitiesNamespacePart());
            }
        }

        protected virtual bool OmitBaseIdentifierInTableNames()
        {
            return false;
        }

        protected virtual string GetEntitiesNamespacePart()
        {
            return EntityExtensions.DEFAULT_ENTITIES_NAMESPACE_PART;
        }

        protected virtual void ConfigureMigrationHistory(ModelBuilder builder)
        {
            // "Copy" default configuration of "HistoryRow" (from HistoryRepository.ConfigureTable)
            builder.Entity<GeneratorsHistoryRow>(history =>
            {
                history.ToTable(this.options.Value.MigrationHistoryTable, this.options.Value.MigrationHistorySchema);
                history.HasKey(h => h.MigrationId);
                history.Property(h => h.MigrationId).HasMaxLength(150);
                history.Property(h => h.ProductVersion).HasMaxLength(32).IsRequired();
                history.Property(h => h.GeneratorsApplied);
            });
        }
    }
}
