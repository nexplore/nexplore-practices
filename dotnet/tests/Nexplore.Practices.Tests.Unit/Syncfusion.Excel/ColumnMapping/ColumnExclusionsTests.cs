namespace Nexplore.Practices.Tests.Unit.Syncfusion.Excel.ColumnMapping
{
    using Nexplore.Practices.Syncfusion.Excel.ColumnMapping;
    using Nexplore.Practices.Syncfusion.Excel.Config;
    using NUnit.Framework;

    [TestFixture]
    public class ColumnExclusionsTests
    {
        private IColumnExclusions<TestEntity> exclusions;

        [SetUp]
        public void SetUp()
        {
            var config = new ExportConfig<TestEntity>();
            this.exclusions = config.Exclusions;
        }

        [Test]
        public void AddOrUpdate_ShouldAddNewExclusion()
        {
            const string propertyName = nameof(TestEntity.Property1);
            this.exclusions.AddOrUpdate(e => e.Property1);

            Assert.That(this.exclusions.IsExcluded(propertyName), Is.True);
        }

        [Test]
        public void GetOrDefault_ShouldNotExcludeProperty_WhenExclusionNotFound()
        {
            const string propertyName = nameof(TestEntity.Property1);

            Assert.That(this.exclusions.IsExcluded(propertyName), Is.False);
        }

        internal sealed class TestEntity
        {
            public string Property1 { get; set; }
        }
    }
}
