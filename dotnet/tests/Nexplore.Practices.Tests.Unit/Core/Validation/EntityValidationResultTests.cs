namespace Nexplore.Practices.Tests.Unit.Core.Validation
{
    using System;
    using Nexplore.Practices.Core.Domain.Model;
    using Nexplore.Practices.Core.Validation;
    using NUnit.Framework;

    [TestFixture]
    public class EntityValidationResultTests
    {
        [Test]
        public void GetEntityName_WithNoEntitySet_ReturnsNULL()
        {
            // Arrange
            var entityValidationResult = new EntityValidationResult(null, Array.Empty<EntityValidationError>());

            // Act
            var entityName = entityValidationResult.GetEntityName();

            // Assert
            Assert.That(entityName, Is.EqualTo("NULL"));
        }

        [Test]
        public void GetEntityName_WithEntityProxy_ReturnsEntityNameWithoutProxySuffix()
        {
            // Arrange
            var entityValidationResult = new EntityValidationResult(new TestEntityProxy(), Array.Empty<EntityValidationError>());

            // Act
            var entityName = entityValidationResult.GetEntityName();

            // Assert
            Assert.That(entityName, Is.EqualTo("TestEntity"));
        }

        [Test]
        public void GetEntityName_WithEntity_ReturnsEntityName()
        {
            // Arrange
            var entityValidationResult = new EntityValidationResult(new TestEntity(), Array.Empty<EntityValidationError>());

            // Act
            var entityName = entityValidationResult.GetEntityName();

            // Assert
            Assert.That(entityName, Is.EqualTo("TestEntity"));
        }

        private sealed class TestEntity : IValidatable
        {
        }

        private sealed class TestEntityProxy : IValidatable
        {
        }
    }
}
