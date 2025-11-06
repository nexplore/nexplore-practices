namespace Nexplore.Practices.Tests.Integration.EntityFramework.ChangeTracking
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Autofac;
    using Nexplore.Practices.Core.ChangeTracking;
    using Nexplore.Practices.Core.Domain;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities;
    using NUnit.Framework;

    [TestFixture]
    public class EntityChangeTrackingServiceTests : ScopedTestsBase
    {
        private IUnitOfWorkFactory<IRepository<EntityWithOwnedTypes>, IEntityChangeTrackingService, IRepository<SomeOtherEntity>> unitOfWorkFactory;

        [SetUp]
        public void Initialize()
        {
            this.unitOfWorkFactory = this.Scope.Resolve<IUnitOfWorkFactory<IRepository<EntityWithOwnedTypes>, IEntityChangeTrackingService, IRepository<SomeOtherEntity>>>();
        }

        [Test]
        public async Task GetChangedProperties_Contains_ChangedProperties()
        {
            // Arrange
            var entityId = await this.AddEntityAsync();

            // Act
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent.GetByIdAsync(entityId);
                entity.Name = "Hans Zimmer changed";
                entity.Address.Street.Name = "Bernstrasse changed";
                entity.Address.Street.Number = "20 changed";
                entity.Address.City = "Thun changed";

                var changedProperties = unitOfWork.Dependent2.GetChangedProperties<EntityWithOwnedTypes, Guid>(entity, detectChanges: true, includeOwnedReferences: true).ToArray();

                // Assert
                Assert.That(changedProperties.Length, Is.EqualTo(4));
                Assert.That(changedProperties.Any(p => p.PropertyName == "Name"), Is.True);
                Assert.That(changedProperties.Any(p => p.PropertyName == "Address.Street.Name"), Is.True);
                Assert.That(changedProperties.Any(p => p.PropertyName == "Address.Street.Number"), Is.True);
                Assert.That(changedProperties.Any(p => p.PropertyName == "Address.City"), Is.True);
                Assert.That(changedProperties.Any(p => p.PropertyName == "Excluded"), Is.False);
            }
        }

        [Test]
        public async Task GetChangedPropertiesWhenOnlyOwnedTypeChanged_Contains_ChangedProperties()
        {
            // Arrange
            var entityId = await this.AddEntityAsync();

            // Act
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent.GetByIdAsync(entityId);
                entity.Address.Street.Number = "20 changed";
                entity.Address.City = "Thun changed";

                var changedProperties = unitOfWork.Dependent2.GetChangedProperties<EntityWithOwnedTypes, Guid>(entity, detectChanges: true, includeOwnedReferences: true).ToArray();

                // Assert
                Assert.That(changedProperties.Length, Is.EqualTo(2));
                Assert.That(changedProperties.Any(p => p.PropertyName == "Address.Street.Number"), Is.True);
                Assert.That(changedProperties.Any(p => p.PropertyName == "Address.City"), Is.True);
            }
        }

        [Test]
        public async Task GetChangedPropertiesWithoutOwnedTypesWhenOnlyOwnedTypeChanged_Is_Empty()
        {
            // Arrange
            var entityId = await this.AddEntityAsync();

            // Act
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent.GetByIdAsync(entityId);
                entity.Address.Street.Number = "20 changed";
                entity.Address.City = "Thun changed";

                var changedProperties = unitOfWork.Dependent2.GetChangedProperties<EntityWithOwnedTypes, Guid>(entity, detectChanges: true, includeOwnedReferences: false).ToArray();

                // Assert
                Assert.That(changedProperties.Length, Is.EqualTo(0));
            }
        }

        [Test]
        public async Task GetChangedPropertiesWhenOnlyRegularPropertyChanged_Contains_ChangedProperty()
        {
            // Arrange
            var entityId = await this.AddEntityAsync();

            // Act
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent.GetByIdAsync(entityId);
                entity.Name = "Hans Zimmer changed";

                var changedProperties = unitOfWork.Dependent2.GetChangedProperties<EntityWithOwnedTypes, Guid>(entity, detectChanges: true, includeOwnedReferences: true).ToArray();

                // Assert
                Assert.That(changedProperties.Length, Is.EqualTo(1));
                Assert.That(changedProperties.Any(p => p.PropertyName == "Name"), Is.True);
            }
        }

        [Test]
        public async Task GetChanges_Returns_CorrectChanges()
        {
            // Arrange
            var entityId = await this.AddEntityAsync();

            // Act
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent.GetByIdAsync(entityId);
                entity.Name = "Hans Zimmer changed";
                entity.Address.Street.Name = "Bernstrasse changed";
                entity.Address.Street.Number = "20 changed";
                entity.Address.City = "Thun changed";

                var propertyNames = new[]
                {
                    "Name",
                    "Address.Street.Name",
                    "Address.City",
                    "ExcludedProperty",
                };

                var changes = unitOfWork.Dependent2.GetChanges<EntityWithOwnedTypes, Guid>(entity, detectChanges: true, includeOwnedReferences: true, propertyNames).ToArray();

                // Assert
                Assert.That(changes.Length, Is.EqualTo(3));
                AssertContainsChange(changes, "Name", "Hans Zimmer", "Hans Zimmer changed");
                AssertContainsChange(changes, "Address.Street.Name", "Bernstrasse", "Bernstrasse changed");
                AssertContainsChange(changes, "Address.City", "Thun", "Thun changed");
                AssertContainsNoChange(changes, "Street.Number"); // Not requested via property names
                AssertContainsNoChange(changes, "ExcludedProperty"); // Requested via property names, but no changes
            }
        }

        [Test]
        public async Task GetChangesWithoutOwnedTypes_Returns_CorrectChanges()
        {
            // Arrange
            var entityId = await this.AddEntityAsync();

            // Act
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent.GetByIdAsync(entityId);
                entity.Name = "Hans Zimmer changed";
                entity.Address.Street.Name = "Bernstrasse changed";
                entity.Address.Street.Number = "20 changed";
                entity.Address.City = "Thun changed";

                var propertyNames = new[]
                {
                    "Name",
                    "Address.Street.Name",
                    "Address.City",
                    "ExcludedProperty",
                };

                var changes = unitOfWork.Dependent2.GetChanges<EntityWithOwnedTypes, Guid>(entity, detectChanges: true, includeOwnedReferences: false, propertyNames).ToArray();

                // Assert
                Assert.That(changes.Length, Is.EqualTo(1));
                AssertContainsChange(changes, "Name", "Hans Zimmer", "Hans Zimmer changed");
            }
        }

        [Test]
        public async Task GetChangesForOwnedTypeChangesOnly_Returns_CorrectChanges()
        {
            // Arrange
            var entityId = await this.AddEntityAsync();

            // Act
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent.GetByIdAsync(entityId);
                entity.Address.Street.Name = "Bernstrasse changed";
                entity.Address.Street.Number = "20 changed";
                entity.Address.City = "Thun changed";

                var propertyNames = new[]
                {
                    "Name",
                    "Address.Street.Number",
                    "Address.Street.Name",
                    "Address.City",
                };

                var changes = unitOfWork.Dependent2.GetChanges<EntityWithOwnedTypes, Guid>(entity, detectChanges: true, includeOwnedReferences: true, propertyNames).ToArray();

                // Assert
                Assert.That(changes.Length, Is.EqualTo(3));
                AssertContainsChange(changes, "Address.Street.Number", "20", "20 changed");
                AssertContainsChange(changes, "Address.Street.Name", "Bernstrasse", "Bernstrasse changed");
                AssertContainsChange(changes, "Address.City", "Thun", "Thun changed");
                AssertContainsNoChange(changes, "Name");
            }
        }

        [Test]
        public async Task GetChangedProperties_WorksForEntitiesThatShareId()
        {
            // Arrange
            var entityId = await this.AddEntityAsync();
            await this.AddSomeOtherEntityAsync(entityId); // Share Id

            // Act
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent.GetByIdAsync(entityId);
                entity.Address.Street.Name = "Bernstrasse changed";

                var someOtherEntity = await unitOfWork.Dependent3.GetByIdAsync(entityId);
                someOtherEntity.SomeValue = "changed";

                var changedProperties = unitOfWork.Dependent2.GetChangedProperties<EntityWithOwnedTypes, Guid>(entity, detectChanges: true, includeOwnedReferences: true).ToArray();

                // Assert
                Assert.That(changedProperties.Any(p => p.PropertyName == "Address.Street.Name"), Is.True);
            }
        }

        [Test]
        public async Task GetChanges_WorksForEntitiesThatShareId()
        {
            // Arrange
            var entityId = await this.AddEntityAsync();
            await this.AddSomeOtherEntityAsync(entityId); // Share Id

            // Act
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent.GetByIdAsync(entityId);
                entity.Address.Street.Name = "Bernstrasse changed";

                var someOtherEntity = await unitOfWork.Dependent3.GetByIdAsync(entityId);
                someOtherEntity.SomeValue = "changed";

                var changedValues = unitOfWork.Dependent2.GetChanges<SomeOtherEntity, Guid>(someOtherEntity, detectChanges: true, includeOwnedReferences: true, nameof(SomeOtherEntity.SomeValue)).ToArray();

                // Assert
                AssertContainsChange(changedValues, nameof(SomeOtherEntity.SomeValue), "value", "changed");
            }
        }

        private async Task<Guid> AddEntityAsync()
        {
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var newEntity = unitOfWork.Dependent.CreateAndAdd();

                newEntity.Name = "Hans Zimmer";
                newEntity.Address.Street.Name = "Bernstrasse";
                newEntity.Address.Street.Number = "20";
                newEntity.Address.City = "Thun";
                newEntity.ExcludedProperty = "Unchanged";

                var changedProperties = unitOfWork.Dependent2.GetChangedProperties<EntityWithOwnedTypes, Guid>(newEntity, detectChanges: true, includeOwnedReferences: true).ToArray();
                Assert.That(changedProperties, Is.Empty);

                await unitOfWork.SaveChangesAsync();

                return newEntity.Id;
            }
        }

        private async Task AddSomeOtherEntityAsync(Guid id)
        {
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var someOtherEntity = new SomeOtherEntity
                {
                    Id = id, // Share Id
                    SomeValue = "value",
                };

                unitOfWork.Dependent3.Add(someOtherEntity);

                await unitOfWork.SaveChangesAsync();
            }
        }

        private static void AssertContainsChange(PropertyWithChanges[] changes, string propertyName, string oldValue, string newValue)
        {
            Assert.That(changes.Any(c => c.PropertyName == propertyName && oldValue.Equals(c.OldValue) && newValue.Equals(c.NewValue)), Is.True);
        }

        private static void AssertContainsNoChange(PropertyWithChanges[] changes, string propertyName)
        {
            Assert.That(changes.Any(c => c.PropertyName == propertyName), Is.False);
        }
    }
}
