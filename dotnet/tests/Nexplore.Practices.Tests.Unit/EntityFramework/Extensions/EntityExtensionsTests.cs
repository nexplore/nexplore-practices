namespace Nexplore.Practices.Tests.Unit.EntityFramework.Extensions
{
    using Nexplore.Practices.EntityFramework.Extensions;
    using NUnit.Framework;

    [TestFixture]
    public class EntityExtensionsTests
    {
        private const string ENTITIES_NAMESPACE_PART = "Entities";

        [Test]
        public void GetSchemaFromNamespace_WithMatchingEntitiesnamespaceAndDirectnamespace_ReturnLowercaseSchema()
        {
            // Arrange
            var entityNamespace = "Customer.Project.MySchema.Entities.MyEntity";

            // Act
            var result = EntityExtensions.GetSchemaFromNamespace(entityNamespace, ENTITIES_NAMESPACE_PART);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.EqualTo("myschema"));
        }

        [Test]
        public void GetSchemaFromNamespace_WithMatchingEntitiesnamespaceAndSubNamespace_ReturnLowercaseSchema()
        {
            // Arrange
            var entityNamespace = "Customer.Project.MySchema.Entities.MySubnamespace.MyEntity";

            // Act
            var result = EntityExtensions.GetSchemaFromNamespace(entityNamespace, ENTITIES_NAMESPACE_PART);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.EqualTo("myschema"));
        }

        [Test]
        public void GetSchemaFromNamespace_WithSchemaOnFirstPosition_ReturnLowercaseSchema()
        {
            // Arrange
            var entityNamespace = "MySchema.Entities.MyEntity";

            // Act
            var result = EntityExtensions.GetSchemaFromNamespace(entityNamespace, ENTITIES_NAMESPACE_PART);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.EqualTo("myschema"));
        }

        [Test]
        public void GetSchemaFromNamespace_WithMissingEntitiesPart_ReturnEmptyString()
        {
            // Arrange
            var entityNamespace = "MySchema.MyEntity";

            // Act
            var result = EntityExtensions.GetSchemaFromNamespace(entityNamespace, ENTITIES_NAMESPACE_PART);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.EqualTo(string.Empty));
        }

        [Test]
        public void GetSchemaFromNamespace_WithEntitiesPartAsFirstpart_ReturnEmptyString()
        {
            // Arrange
            var entityNamespace = "Entities.MyEntity";

            // Act
            var result = EntityExtensions.GetSchemaFromNamespace(entityNamespace, ENTITIES_NAMESPACE_PART);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.EqualTo(string.Empty));
        }
    }
}
