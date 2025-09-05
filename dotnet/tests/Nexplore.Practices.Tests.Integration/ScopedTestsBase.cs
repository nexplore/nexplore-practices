namespace Nexplore.Practices.Tests.Integration
{
    using Autofac;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Infrastructure;
    using Nexplore.Practices.Core.Domain.Model.Audit.Entities;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities;
    using NUnit.Framework;

    public abstract class ScopedTestsBase
    {
        private IUnitOfWork unitOfWork;

        protected ILifetimeScope Scope { get; private set; }

        [SetUp]
        public void SetUpInternal()
        {
            var unitOfWorkScope = AssemblySetUp.UnitOfWorkFactory.Begin(this.ConfigureScopeInternal);

            this.unitOfWork = unitOfWorkScope;
            this.Scope = unitOfWorkScope.Dependent;

            this.CleanUp();
        }

        [TearDown]
        public void TearDownInternal()
        {
            this.unitOfWork?.Dispose();
            this.Scope?.Dispose();
        }

        protected virtual void ConfigureScope(ContainerBuilder builder)
        {
        }

        private void ConfigureScopeInternal(ContainerBuilder builder)
        {
            this.ConfigureScope(builder);
        }

        private void CleanUp()
        {
            using (var cleanupUnitOfWork = this.Scope.Resolve<IUnitOfWorkFactory<DatabaseFacade>>().Begin())
            {
                var facade = cleanupUnitOfWork.Dependent;
                facade.ExecuteSqlRaw($"DELETE FROM [audit].[{nameof(AuditHistory)}]");
                facade.ExecuteSqlRaw($"DELETE FROM [test].[{nameof(EntityWithOwnedTypes)}]");
                facade.ExecuteSqlRaw($"DELETE FROM [test].[{nameof(TestEntity)}]");
            }
        }
    }
}
