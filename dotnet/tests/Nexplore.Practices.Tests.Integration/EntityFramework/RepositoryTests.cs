namespace Nexplore.Practices.Tests.Integration.EntityFramework
{
    using System.Threading.Tasks;
    using Autofac;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test;
    using NUnit.Framework;

    [TestFixture]
    public class RepositoryTests : ScopedTestsBase
    {
        private IUnitOfWorkFactory<ITestRepository> unitOfWorkFactory;

        [SetUp]
        public void Initialize()
        {
            this.unitOfWorkFactory = this.Scope.Resolve<IUnitOfWorkFactory<ITestRepository>>();
        }

        [Test]
        public async Task GetBySingleOrDefaultAsync_WithLocalCache_TakesEntityFromLocalCache()
        {
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Arrange
                var entity = unitOfWork.Dependent.CreateAndAdd();

                // Act
                var reloadedEntity = await unitOfWork.Dependent.GetBySingleAsync(e => e.Id == entity.Id, ignoreLocalCache: false);

                // Assert
                Assert.That(reloadedEntity, Is.Not.Null);
            }
        }

        [Test]
        public async Task GetBySingleOrDefaultAsync_WithoutLocalCache_DoesNotTakeEntityFromLocalCache()
        {
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Arrange
                var entity = unitOfWork.Dependent.CreateAndAdd();

                // Act
                var reloadedEntity = await unitOfWork.Dependent.GetBySingleOrDefaultAsync(e => e.Id == entity.Id, ignoreLocalCache: true);

                // Assert
                Assert.That(reloadedEntity, Is.Null);
            }
        }
    }
}
