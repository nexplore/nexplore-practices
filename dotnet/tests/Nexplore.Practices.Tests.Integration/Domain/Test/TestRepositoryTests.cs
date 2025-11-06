namespace Nexplore.Practices.Tests.Integration.Domain.Test
{
    using System;
    using System.Threading.Tasks;
    using Autofac;
    using Nexplore.Practices.Core;
    using Nexplore.Practices.Core.Domain;
    using Nexplore.Practices.Core.Exceptions;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test;
    using NUnit.Framework;

    [TestFixture]
    public class TestRepositoryTests : ScopedTestsBase
    {
        private IUnitOfWorkFactory<ITestRepository, IClock> unitOfWorkFactory;

        [SetUp]
        public void Initialize()
        {
            this.unitOfWorkFactory = this.Scope.Resolve<IUnitOfWorkFactory<ITestRepository, IClock>>();
        }

        [TearDown]
        public async Task CleanUp()
        {
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent.GetBySingleOrDefaultAsync(e => e.FirstName == "Test Firstname");
                if (entity != null)
                {
                    unitOfWork.Dependent.Remove(entity);
                    await unitOfWork.SaveChangesAsync();
                }
            }
        }

        [Test]
        public void GetByIdAsync_WithNonExistingEntityId_ThrowsEntityNotFoundException()
        {
            // Arrange
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Act
                AsyncTestDelegate act = async () => await unitOfWork.Dependent.GetByIdAsync(Guid.NewGuid());

                // Assert
                Assert.That(act, Throws.Exception.InstanceOf<EntityNotFoundException>());
            }
        }

        [Test]
        public async Task GetByIdAsync_WithExistingId_ReturnsEntity()
        {
            // Arrange
            var entityId = Guid.Empty;
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = unitOfWork.Dependent.Create();
                entity.FirstName = "Test Firstname";
                entity.LastName = "Test Lastname";

                unitOfWork.Dependent.Add(entity);
                await unitOfWork.SaveChangesAsync();

                entityId = entity.Id;
            }

            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Act
                var entity = await unitOfWork.Dependent.GetByIdAsync(entityId);

                // Assert
                Assert.That(entity, Is.Not.Null);
                Assert.That(entity.Id, Is.EqualTo(entityId));
                Assert.That(entity.FirstName, Is.EqualTo("Test Firstname"));
                Assert.That(entity.LastName, Is.EqualTo("Test Lastname"));
            }
        }
    }
}