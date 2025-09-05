namespace Nexplore.Practices.Tests.Unit.Core.Query.Objects
{
    using System.Linq;
    using Nexplore.Practices.Core.Query.Objects;
    using NUnit.Framework;

    [TestFixture]
    public class QueryParamsTests
    {
        [Test]
        public void Clone_WithPopulatedProperties_ReturnsExactClone()
        {
            // Arrange
            var original = new QueryParams { IncludeTotal = true, Skip = 20, Take = 100 };
            original.Orderings.Add(new Ordering { Field = "FirstField", Direction = OrderDirection.Asc });
            original.Orderings.Add(new Ordering { Field = "SecondField", Direction = OrderDirection.Desc });
            original.Orderings.Add(new Ordering { Field = "ThirdField", Direction = OrderDirection.Asc });

            // Act
            var clone = original.Clone();

            // Assert
            Assert.That(clone.IncludeTotal, Is.EqualTo(original.IncludeTotal));
            Assert.That(clone.Skip, Is.EqualTo(original.Skip));
            Assert.That(clone.Take, Is.EqualTo(original.Take));
            Assert.That(clone.Orderings.Count, Is.EqualTo(3));
            Assert.That(clone.Orderings, Is.EquivalentTo(original.Orderings).Using<Ordering, Ordering>(AreSameOrderings));
            Assert.That(clone.Orderings.First(), Is.EqualTo(original.Orderings.First()).Using<Ordering, Ordering>(AreSameOrderings));
            Assert.That(clone.Orderings.ElementAt(2), Is.EqualTo(original.Orderings.ElementAt(2)).Using<Ordering, Ordering>(AreSameOrderings));
        }

        private static bool AreSameOrderings(Ordering a, Ordering b)
        {
            return a.Field == b.Field && a.Direction == b.Direction;
        }
    }
}
