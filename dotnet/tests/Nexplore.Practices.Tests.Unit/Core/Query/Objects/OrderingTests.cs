namespace Nexplore.Practices.Tests.Unit.Core.Query.Objects
{
    using Nexplore.Practices.Core.Query.Objects;
    using NUnit.Framework;

    [TestFixture]
    public class OrderingTests
    {
        [TestCase("AscField", OrderDirection.Asc)]
        [TestCase("DescField", OrderDirection.Desc)]
        public void Clone_WithPopulatedProperties_ReturnsExactClone(string field, OrderDirection direction)
        {
            // Arrange
            var original = new Ordering() { Field = field, Direction = direction };

            // Act
            var clone = original.Clone();

            // Assert
            Assert.That(clone.Field, Is.EqualTo(original.Field));
            Assert.That(clone.Direction, Is.EqualTo(original.Direction));
        }
    }
}
