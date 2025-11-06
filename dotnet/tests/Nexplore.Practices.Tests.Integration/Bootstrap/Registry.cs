namespace Nexplore.Practices.Tests.Integration.Bootstrap
{
    using System.Collections.Generic;
    using Autofac;
    using Autofac.Core.Lifetime;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Logging.Abstractions;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Configuration;
    using Nexplore.Practices.Core;
    using Nexplore.Practices.Core.Administration;
    using Nexplore.Practices.EntityFramework.Configuration;
    using Nexplore.Practices.EntityFramework.Validation;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Administration;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Validation;
    using Nexplore.Practices.Web.Configuration;
    using Nexplore.Practices.Web.Localization;

    public class Registry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterType<NullLoggerFactory>().As<ILoggerFactory>().SingleInstance();

            builder.RegisterType<ValidationContext>().As<IValidationContext>().InstancePerLifetimeScope();
            builder.RegisterType<ValidationProvider<IValidationContext>>().As<IValidationProvider>().InstancePerLifetimeScope();

            builder.RegisterType<VersionInfoResolver<Registry>>().As<IVersionInfoResolver>().SingleInstance();
            builder.Register<IUserInfoResolver>(_ => new UserInfoResolver(new TestUserInfo(), new SystemUserInfo())).InstancePerMatchingLifetimeScope(LifetimeScope.RootTag, PracticesConstants.Scopes.TOP_LEVEL_CHILD_SCOPE_TAG);

            var configuration = ConfigurationFactory.Create(GetMemoryConfig);

            var databaseOption = Options.Create(configuration.GetSection(DatabaseOptions.NAME).Get<DatabaseOptions>() ?? new DatabaseOptions());
            builder.RegisterInstance(databaseOption).SingleInstance();

            var auditOptions = Options.Create(configuration.GetSection(AuditOptions.NAME).Get<AuditOptions>() ?? new AuditOptions());
            builder.RegisterInstance(auditOptions).SingleInstance();

            var apiOptions = Options.Create(configuration.GetSection(ApiOptions.NAME).Get<ApiOptions>() ?? new ApiOptions());
            builder.RegisterInstance(apiOptions).SingleInstance();

            var localizationOptions = Options.Create(configuration.GetSection(LocalizationOptions.NAME).Get<LocalizationOptions>() ?? new LocalizationOptions());
            builder.RegisterInstance(localizationOptions).SingleInstance();
        }

        private static IEnumerable<KeyValuePair<string, string>> GetMemoryConfig()
        {
            yield return KeyValuePair.Create("Database:ExecuteSampleDataGenerators", "false");
            yield return KeyValuePair.Create("Database:ExecuteTestDataGenerators", "true");
            yield return KeyValuePair.Create("Database:MigrationAssembly", default(string));
            yield return KeyValuePair.Create("Database:MappingConfigurationAssemblies:0", typeof(AssemblySetUp).Namespace);
        }
    }
}
