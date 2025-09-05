namespace Nexplore.Practices.Tests.Unit.Core.Extensions
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Linq.Expressions;
    using Nexplore.Practices.Core.Extensions;
    using NUnit.Framework;

    [TestFixture]
    public class ExpressionExtensionsTests
    {
        [Test]
        public void ExtractBodyProperties_WithProperty_CorrectlyExtractProperties()
        {
            // Arrange
            Expression<Func<Entity, object>> expression = e => e.Property;

            // Act
            var result = expression.ExtractBodyProperties();

            // Assert
            Assert.That(result, Is.EqualTo("Property"));
        }

        [Test]
        public void ExtractBodyProperties_WithMultipleProperties_CorrectlyExtractProperties()
        {
            // Arrange
            Expression<Func<Entity, object>> expression = e => e.Property.Property.Property;

            // Act
            var result = expression.ExtractBodyProperties();

            // Assert
            Assert.That(result, Is.EqualTo("Property.Property.Property"));
        }

        [Test]
        public void ExtractBodyProperties_WithCollection_CorrectlyExtractProperties()
        {
            // Arrange
            Expression<Func<Entity, object>> expression = e => e.Collection;

            // Act
            var result = expression.ExtractBodyProperties();

            // Assert
            Assert.That(result, Is.EqualTo("Collection"));
        }

        [Test]
        public void ExtractBodyProperties_WithCollectionAndProperty_CorrectlyExtractProperties()
        {
            // Arrange
            Expression<Func<Entity, object>> expression = e => e.Collection.Select(c => c.Property);

            // Act
            var result = expression.ExtractBodyProperties();

            // Assert
            Assert.That(result, Is.EqualTo("Collection.Property"));
        }

        [Test]
        public void ExtractBodyProperties_WithPropertyAndCollection_CorrectlyExtractProperties()
        {
            // Arrange
            Expression<Func<Entity, object>> expression = e => e.Property.Collection;

            // Act
            var result = expression.ExtractBodyProperties();

            // Assert
            Assert.That(result, Is.EqualTo("Property.Collection"));
        }

        [Test]
        public void ExtractBodyProperties_WithNestedPropertiesAndCollections_CorrectlyExtractProperties()
        {
            // Arrange
            Expression<Func<Entity, object>> expression = e => e.Collection.Select(c => c.Collection.Select(i => i.Property.Collection));

            // Act
            var result = expression.ExtractBodyProperties();

            // Assert
            Assert.That(result, Is.EqualTo("Collection.Collection.Property.Collection"));
        }

        private sealed class Entity
        {
            public Entity Property { get; set; }

            public ICollection<Entity> Collection { get; set; }
        }
    }
}