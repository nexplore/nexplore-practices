namespace Nexplore.Practices.Tests.Integration
{
    using System.Threading.Tasks;
    using Autofac;
    using Autofac.Extensions.DependencyInjection;
    using Microsoft.Data.SqlClient;
    using Microsoft.EntityFrameworkCore.Infrastructure;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.EntityFramework.Configuration;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Services;
    using NUnit.Framework;
    using Testcontainers.MsSql;

    [SetUpFixture]
    public static class AssemblySetUp
    {
        private static IContainer container;
        private static MsSqlContainer msSqlContainer;

        public static IUnitOfWorkFactory<ILifetimeScope> UnitOfWorkFactory { get; private set; }

        [OneTimeSetUp]
        public static async Task SetUpAsync()
        {
            container = CreateContainer();
            UnitOfWorkFactory = container.Resolve<IUnitOfWorkFactory<ILifetimeScope>>();

            msSqlContainer = new MsSqlBuilder()
                .Build();
            await msSqlContainer.StartAsync();

            var databaseOptions = container.Resolve<IOptions<DatabaseOptions>>();
            var connectionStringBuilder = new SqlConnectionStringBuilder(msSqlContainer.GetConnectionString());
            connectionStringBuilder.InitialCatalog = "Practices.Integration";
            databaseOptions.Value.ConnectionString = connectionStringBuilder.ConnectionString;

            using (var unit = UnitOfWorkFactory.Begin())
            {
                var scope = unit.Dependent;
                var databaseFacade = scope.Resolve<DatabaseFacade>();
                await databaseFacade.EnsureDeletedAsync();
                await databaseFacade.EnsureCreatedAsync();
            }
        }

        [OneTimeTearDown]
        public static async Task TearDownAsync()
        {
            await msSqlContainer.DisposeAsync();
            container.Dispose();
        }

        private static IContainer CreateContainer()
        {
            var services = new ServiceCollection();
            services.AddLogging();
            services.AddLocalization();

            var builder = new ContainerBuilder();
            builder.Populate(services);

            builder.RegisterModule<Nexplore.Practices.Core.Registry>();
            builder.RegisterModule<Nexplore.Practices.EntityFramework.Registry>();
            builder.RegisterModule<Nexplore.Practices.Web.Registry>();

            builder.RegisterModule<Nexplore.Practices.Tests.Integration.Bootstrap.Registry>();

            builder.RegisterModule<Registry>();

            return builder.Build();
        }

        private sealed class Registry : Module
        {
            protected override void Load(ContainerBuilder builder)
            {
                builder.RegisterGeneric(typeof(Repository<>)).As(typeof(IRepository<>)).InstancePerLifetimeScope();
                builder.RegisterType<TestRepository>().As<ITestRepository>().InstancePerLifetimeScope();

                builder.RegisterType<ListResultService>().As<IListResultService>().InstancePerLifetimeScope();
            }
        }
    }
}
