namespace Nexplore.Practices.Tests.Unit.Core.Extensions
{
    using System;
    using System.Linq.Expressions;
    using Nexplore.Practices.Core.Extensions;
    using NUnit.Framework;

    [TestFixture]
    public class PropertyPathExtensionsTests
    {
        private readonly Entity entity = new();

        private string InstanceProperty { get; }

        private Entity InstanceReference { get; }

        [Test]
        public void PropertyPath_Returns_PropertyPathConcatenatedWithDot()
        {
            // Arrange
            Expression<Func<string>> expressionProperty = () => this.entity.Property;
            Expression<Func<string>> expressionReferenceProperty = () => this.entity.Reference.Property;
            Expression<Func<string>> expressionReferenceReferenceProperty = () => this.entity.Reference.Reference.Property;

            // Act
            var propertyPath = expressionProperty.PropertyPath();
            var referencePropertyPath = expressionReferenceProperty.PropertyPath();
            var referenceReferencePropertyPath = expressionReferenceReferenceProperty.PropertyPath();

            // Assert
            Assert.That(propertyPath, Is.EqualTo("Property"));
            Assert.That(referencePropertyPath, Is.EqualTo("Reference.Property"));
            Assert.That(referenceReferencePropertyPath, Is.EqualTo("Reference.Reference.Property"));
        }

        [Test]
        public void PropertyPathForInstanceProperties_Returns_PropertyPathConcatenatedWithDot()
        {
            // Arrange
            Expression<Func<string>> expressionProperty = () => this.InstanceProperty;
            Expression<Func<string>> expressionReferenceProperty = () => this.InstanceReference.Property;

            // Act
            var propertyPath = expressionProperty.PropertyPath();
            var referencePropertyPath = expressionReferenceProperty.PropertyPath();

            // Assert
            Assert.That(propertyPath, Is.EqualTo("InstanceProperty"));
            Assert.That(referencePropertyPath, Is.EqualTo("InstanceReference.Property"));
        }

        [Test]
        [TestCase(null, "Property", "Property")]
        [TestCase("", "Property", "Property")]
        [TestCase("Reference", "Property", "Reference.Property")]
        [TestCase("Reference1.Reference2", "Property", "Reference1.Reference2.Property")]
        public void ConcatPropertyPath_ConcatsPath_Correctly(string parentPath, string path, string expectedResult)
        {
            // Act
            var result = parentPath.ConcatPropertyPath(path);

            // Assert
            Assert.That(result, Is.EqualTo(expectedResult));
        }

        private sealed class Entity
        {
            public string Property { get; }

            public Entity Reference { get; }
        }
    }
}
