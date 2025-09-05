namespace Nexplore.Practices.Tests.Integration.EntityFramework.Audit
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Autofac;
    using Nexplore.Practices.Core.ChangeTracking;
    using Nexplore.Practices.Core.Domain;
    using Nexplore.Practices.Core.Domain.Model.Audit;
    using Nexplore.Practices.Core.Domain.Model.Audit.Entities;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities;
    using NUnit.Framework;

    [TestFixture]
    public class AuditLogTests : ScopedTestsBase
    {
        private IUnitOfWorkFactory<IAuditHistoryRepository, IRepository<EntityWithOwnedTypes>, IRepository<ExcludedEntity>> unitOfWorkFactory;

        [SetUp]
        public void Initialize()
        {
            this.unitOfWorkFactory = this.Scope.Resolve<IUnitOfWorkFactory<IAuditHistoryRepository, IRepository<EntityWithOwnedTypes>, IRepository<ExcludedEntity>>>();
        }

        [Test]
        public async Task AuditLog_Persists_PropertyChanges()
        {
            // Arrange
            var id = await this.AddEntityAsync();

            // Act
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent2.GetByIdAsync(id);
                entity.Name = "Hans Zimmer changed";
                entity.Address.Street.Name = "Bernstrasse changed";
                entity.Address.Street.Number = "20 changed";
                entity.Address.City = "Thun changed";

                await unitOfWork.SaveChangesAsync();
            }

            // Assert
            await this.AssertAuditAsync(history =>
            {
                AssertHistoryChange(history, typeof(EntityWithOwnedTypes).FullName, "Name", "Hans Zimmer", "Hans Zimmer changed");
                AssertHistoryChange(history, typeof(EntityWithOwnedTypes).FullName, "Address.Street.Name", "Bernstrasse", "Bernstrasse changed");
                AssertHistoryChange(history, typeof(EntityWithOwnedTypes).FullName, "Address.Street.Number", "20", "20 changed");
                AssertHistoryChange(history, typeof(EntityWithOwnedTypes).FullName, "Address.City", "Thun", "Thun changed");
            });
        }

        [Test]
        public async Task AuditLog_Persists_DeletedValues()
        {
            // Arrange
            var id = await this.AddEntityAsync();

            // Act
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent2.GetByIdAsync(id);
                unitOfWork.Dependent2.Remove(entity);

                await unitOfWork.SaveChangesAsync();
            }

            // Assert
            await this.AssertAuditAsync(history =>
            {
                AssertHistoryDelete(history, typeof(EntityWithOwnedTypes).FullName, "Name", "Hans Zimmer", null);
                AssertHistoryDelete(history, typeof(EntityWithOwnedTypes).FullName, "Address.Street.Name", "Bernstrasse", null);
                AssertHistoryDelete(history, typeof(EntityWithOwnedTypes).FullName, "Address.Street.Number", "20", null);
                AssertHistoryDelete(history, typeof(EntityWithOwnedTypes).FullName, "Address.City", "Thun", null);
            });
        }

        [Test]
        public async Task AuditLog_Ignores_ExcludedProperties()
        {
            // Arrange
            var id = await this.AddEntityAsync();

            // Act
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent2.GetByIdAsync(id);
                entity.Name = "Hans Zimmer changed";
                entity.ExcludedProperty = "Excluded changed";

                await unitOfWork.SaveChangesAsync();
            }

            // Assert
            await this.AssertAuditAsync(history =>
            {
                AssertHistoryChange(history, typeof(EntityWithOwnedTypes).FullName, "Name", "Hans Zimmer", "Hans Zimmer changed");
                AssertNoHistory(history, typeof(EntityWithOwnedTypes).FullName, nameof(EntityWithOwnedTypes.ExcludedProperty));
            });
        }

        [Test]
        public async Task AuditLog_Ignores_ExcludedTypes()
        {
            // Arrange
            var id = await this.AddExcludedEntityAsync();

            // Act
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var entity = await unitOfWork.Dependent3.GetByIdAsync(id);
                entity.Name = "Luke Excluded changed";
                await unitOfWork.SaveChangesAsync();
            }

            // Assert
            await this.AssertAuditAsync(history =>
            {
                AssertNoHistory(history, typeof(ExcludedEntity).FullName);
            });
        }

        private static void AssertHistoryChange(AuditHistory[] history, string ownerEntityType, string path, string oldValue, string newValue)
        {
            AssertInHistory(history, SaveOperation.Update, ownerEntityType, path, oldValue, newValue);
        }

        private static void AssertHistoryDelete(AuditHistory[] history, string ownerEntityType, string path, string oldValue, string newValue)
        {
            AssertInHistory(history, SaveOperation.Remove, ownerEntityType, path, oldValue, newValue);
        }

        private static void AssertNoHistory(AuditHistory[] history, string entityType)
        {
            Assert.That(history.All(h => h.EntityType != entityType), Is.True, message: $"Entity '{entityType}' must not have audit entries.");
        }

        private static void AssertNoHistory(AuditHistory[] history, string entityType, string path)
        {
            Assert.That(!history.Any(h => h.EntityType == entityType && h.PropertyName == path), Is.True, message: $"Property {path} on entity '{entityType}' must not have  audit entries.");
        }

        private static void AssertInHistory(AuditHistory[] history, SaveOperation operation, string entityName, string path, string oldValue, string newValue)
        {
            var opString = operation == SaveOperation.Update ? "Update" : "Delete";
            var message = $"{opString} '{entityName}' path '{path}': {oldValue} => {newValue} not found.";
            Assert.That(history.Any(h => h.ModificationType == Enum.GetName(operation) && h.EntityType == entityName && h.PropertyName == path && h.OldValue == oldValue && h.NewValue == newValue), Is.True, message);
        }

        private async Task<Guid> AddExcludedEntityAsync()
        {
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var excludedEntity = unitOfWork.Dependent3.CreateAndAdd();

                excludedEntity.Name = "Luke Excluded";

                await unitOfWork.SaveChangesAsync();

                return excludedEntity.Id;
            }
        }

        private async Task<Guid> AddEntityAsync()
        {
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var newEntity = unitOfWork.Dependent2.CreateAndAdd();

                newEntity.Name = "Hans Zimmer";
                newEntity.Address.Street.Name = "Bernstrasse";
                newEntity.Address.Street.Number = "20";
                newEntity.Address.City = "Thun";

                newEntity.ExcludedProperty = "Excluded";

                await unitOfWork.SaveChangesAsync();

                return newEntity.Id;
            }
        }

        private async Task AssertAuditAsync(Action<AuditHistory[]> assertAction)
        {
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                assertAction(await unitOfWork.Dependent.LoadAuditHistoryAsync(DateTimeOffset.UtcNow.AddHours(-1), DateTimeOffset.UtcNow));
            }
        }
    }
}
