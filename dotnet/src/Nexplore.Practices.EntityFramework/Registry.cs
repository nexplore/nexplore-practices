namespace Nexplore.Practices.EntityFramework
{
    using Autofac;
    using Microsoft.AspNetCore.DataProtection.Repositories;
    using Microsoft.AspNetCore.DataProtection.XmlEncryption;
    using Nexplore.Practices.Configuration;
    using Nexplore.Practices.Core.ChangeTracking;
    using Nexplore.Practices.Core.Domain.Model.Audit;
    using Nexplore.Practices.Core.Generators;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.Core.Services;
    using Nexplore.Practices.EntityFramework.ChangeTracking;
    using Nexplore.Practices.EntityFramework.Configuration;
    using Nexplore.Practices.EntityFramework.Domain.Audit;
    using Nexplore.Practices.EntityFramework.Generators;
    using Nexplore.Practices.EntityFramework.Metadata;
    using Nexplore.Practices.EntityFramework.Migrations;
    using Nexplore.Practices.EntityFramework.Scopes;
    using Nexplore.Practices.EntityFramework.Security;
    using Nexplore.Practices.EntityFramework.Services;

    public class Registry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            // Configure database
            builder.RegisterType<DbContextFactory>().As<IDbContextFactory>().InstancePerDependency();
            builder.RegisterType<DbContextTransactionFactory>().As<IDbContextTransactionFactory>().InstancePerDependency();
            builder.RegisterType<DbModelCreator>().As<IDbModelCreator>().InstancePerDependency();
            builder.RegisterType<DbContextOptionsProvider>().As<IDbContextOptionsProvider>().InstancePerDependency();

            // Configure unit of work
            builder.RegisterGeneric(typeof(UnitOfWorkFactory<>)).As(typeof(IUnitOfWorkFactory<>)).InstancePerDependency();
            builder.RegisterGeneric(typeof(UnitOfWorkFactory<,>)).As(typeof(IUnitOfWorkFactory<,>)).InstancePerDependency();
            builder.RegisterGeneric(typeof(UnitOfWorkFactory<,,>)).As(typeof(IUnitOfWorkFactory<,,>)).InstancePerDependency();

            // Generators
            builder.RegisterType<MigrationService>().As<IMigrationService>();
            builder.RegisterType<DataSeedingService>().As<IDataSeedingService>();
            builder.RegisterType<GeneratorRunner>().As<IGeneratorRunner>();
            builder.RegisterType<GeneratorVisitor>().As<IGeneratorVisitor>();
            builder.RegisterGeneric(typeof(GeneratorDependencyNode<>)).As(typeof(IGeneratorDependencyNode<>));

            // Configure meta data
            builder.RegisterType<EntityMetadataProvider>().As<IEntityMetadataProvider>().InstancePerDependency();

            // Configure data projection
            builder.RegisterType<DataProtectionKeyRepository>().As<IXmlRepository>().InstancePerLifetimeScope();
            builder.RegisterType<DataProtectionKeyEncryptionService>().As<IXmlEncryptor>().InstancePerLifetimeScope();
            builder.RegisterType<DataProtectionKeyEncryptionService>().As<IXmlDecryptor>().InstancePerLifetimeScope();

            // Change Tracking
            builder.RegisterType<EntityChangeTrackingService>().As<IEntityChangeTrackingService>().InstancePerLifetimeScope();

            // Configure services
            builder.RegisterType<DbTimeoutService>().As<IDbTimeoutService>().InstancePerLifetimeScope();

            // Audit history
            builder.RegisterType<AuditHistoryCleanupService>().As<IAuditHistoryCleanupService>().InstancePerLifetimeScope();
            builder.RegisterType<AuditHistoryRepository>().As<IAuditHistoryRepository>().InstancePerLifetimeScope();
            builder.RegisterType<AuditHistoryProvider>().As<IAuditHistoryProvider>().InstancePerDependency();

            // Load configuration
            builder.AddOption<DatabaseOptions>(DatabaseOptions.NAME);
            builder.AddOption<AuditOptions>(AuditOptions.NAME);
        }
    }
}
