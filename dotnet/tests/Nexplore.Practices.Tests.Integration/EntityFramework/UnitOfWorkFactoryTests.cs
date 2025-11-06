namespace Nexplore.Practices.Tests.Integration.EntityFramework
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Autofac;
    using Microsoft.EntityFrameworkCore.ChangeTracking;
    using Nexplore.Practices.Core;
    using Nexplore.Practices.Core.Domain;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities;
    using NUnit.Framework;

    [TestFixture]
    public class UnitOfWorkFactoryTests : ScopedTestsBase
    {
        private IUnitOfWorkFactory<ITestRepository, IClock, IUnitOfWorkFactory<ITestRepository, IClock>> unitOfWorkFactory;

        [SetUp]
        public void Initialize()
        {
            this.unitOfWorkFactory = this.Scope.Resolve<IUnitOfWorkFactory<ITestRepository, IClock, IUnitOfWorkFactory<ITestRepository, IClock>>>();
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
        public async Task BeginWithSingleDbTransaction_WithNoCommitDbTransaction_PersistsNothing()
        {
            // Arrange
            var entityId = Guid.Empty;
            using (var unitOfWork = this.unitOfWorkFactory.BeginWithSingleDbTransaction())
            {
                var entity = unitOfWork.Dependent.Create();
                entity.FirstName = "Test Firstname";
                entity.LastName = "Test Lastname";

                unitOfWork.Dependent.Add(entity);

                // Act
                await unitOfWork.SaveChangesAsync();

                entityId = entity.Id;
            }

            // Assert
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent.GetByIdOrDefaultAsync(entityId);

                Assert.That(entity, Is.Null);
            }
        }

        [Test]
        public async Task BeginWithSingleDbTransaction_WithCommitDbTransaction_PersistsChanges()
        {
            // Arrange
            var entityId = Guid.Empty;
            using (var unitOfWork = this.unitOfWorkFactory.BeginWithSingleDbTransaction())
            {
                var entity = unitOfWork.Dependent.Create();
                entity.FirstName = "Test Firstname";
                entity.LastName = "Test Lastname";

                unitOfWork.Dependent.Add(entity);

                // Act
                await unitOfWork.SaveChangesAsync();
                unitOfWork.CommitDbTransaction();

                entityId = entity.Id;
            }

            // Assert
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent.GetByIdOrDefaultAsync(entityId);

                Assert.That(entity, Is.Not.Null);
                Assert.That(entity.Id, Is.EqualTo(entityId));
                Assert.That(entity.FirstName, Is.EqualTo("Test Firstname"));
                Assert.That(entity.LastName, Is.EqualTo("Test Lastname"));
            }
        }

        [Test]
        public async Task BeginWithSingleDbTransaction_WithChildUnitOfWork_ShareTransaction()
        {
            using (var superUnit = this.unitOfWorkFactory.BeginWithSingleDbTransaction())
            {
                // Arrange
                var entityId = Guid.Empty;
                using (var unitOfWork = superUnit.Dependent3.Begin())
                {
                    var entity = unitOfWork.Dependent.Create();
                    entity.FirstName = "Test Firstname";
                    entity.LastName = "Test Lastname";

                    unitOfWork.Dependent.Add(entity);
                    await unitOfWork.SaveChangesAsync();

                    entityId = entity.Id;
                }

                using (var unitOfWork = superUnit.Dependent3.Begin())
                {
                    // Act
                    var entity = await unitOfWork.Dependent.GetByIdAsync(entityId);

                    // Assert
                    Assert.That(entity, Is.Not.Null);
                    Assert.That(entity.Id, Is.EqualTo(entityId));
                    Assert.That(entity.FirstName, Is.EqualTo("Test Firstname"));
                    Assert.That(entity.LastName, Is.EqualTo("Test Lastname"));
                }

                superUnit.CommitDbTransaction();
            }
        }

        [Test]
        public async Task BeginWithSingleDbTransaction_InSeparatedUnitOfWorks_AreIsolatedUntilCommitDbTransaction()
        {
            // Arrange
            using (var leftUnit = this.unitOfWorkFactory.BeginWithSingleDbTransaction())
            using (var rightUnit = this.unitOfWorkFactory.BeginWithSingleDbTransaction())
            {
                var entity = leftUnit.Dependent.Create();
                entity.FirstName = "Test Firstname";
                entity.LastName = "Test Lastname";

                leftUnit.Dependent.Add(entity);

                // Act
                await leftUnit.SaveChangesAsync();

                var entityId = entity.Id;

                // Assert
                var rightEntityTry = await rightUnit.Dependent.GetByIdOrDefaultAsync(entityId);
                Assert.That(rightEntityTry, Is.Null);

                // Act
                leftUnit.CommitDbTransaction();

                // Assert
                var rightEntitySecondTry = await rightUnit.Dependent.GetByIdOrDefaultAsync(entityId);
                Assert.That(rightEntitySecondTry, Is.Not.Null);
                Assert.That(entity.Id, Is.EqualTo(entityId));
                Assert.That(entity.FirstName, Is.EqualTo("Test Firstname"));
                Assert.That(entity.LastName, Is.EqualTo("Test Lastname"));
            }
        }

        [Test]
        public void Begin_WithNestedUnitOfWork_CreatesSeparatedChangeTracker()
        {
            // Arrange
            using (var outerUnitOfWork = this.Scope.Resolve<IUnitOfWorkFactory<ITestRepository, ChangeTracker, ILifetimeScope>>().Begin())
            {
                var outerEntity = outerUnitOfWork.Dependent.CreateAndAdd();

                using (var innerUnitOfWork = outerUnitOfWork.Dependent3.Resolve<IUnitOfWorkFactory<ITestRepository, ChangeTracker>>().Begin())
                {
                    var innerEntity = innerUnitOfWork.Dependent.CreateAndAdd();

                    // Act
                    outerUnitOfWork.Dependent2.DetectChanges();
                    var outerEntries = outerUnitOfWork.Dependent2.Entries<TestEntity>().ToArray();

                    innerUnitOfWork.Dependent2.DetectChanges();
                    var innerEntries = innerUnitOfWork.Dependent2.Entries<TestEntity>().ToArray();

                    // Assert
                    Assert.That(outerEntries.Length, Is.EqualTo(1));
                    Assert.That(outerEntries[0].Entity.Id, Is.EqualTo(outerEntity.Id));

                    Assert.That(innerEntries.Length, Is.EqualTo(1));
                    Assert.That(innerEntries[0].Entity.Id, Is.EqualTo(innerEntity.Id));
                }
            }
        }
    }
}
