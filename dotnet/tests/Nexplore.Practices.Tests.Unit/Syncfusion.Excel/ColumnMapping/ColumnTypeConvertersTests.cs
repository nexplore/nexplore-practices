namespace Nexplore.Practices.Tests.Unit.Syncfusion.Excel.ColumnMapping
{
    using System.Globalization;
    using Nexplore.Practices.Syncfusion.Excel.ColumnMapping;
    using Nexplore.Practices.Syncfusion.Excel.Config;
    using NUnit.Framework;

    [TestFixture]
    public class ColumnTypeConvertersTests
    {
        private IColumnTypeConverters converters;

        [SetUp]
        public void SetUp()
        {
            var config = new ExportConfig<TestEntity>();
            this.converters = config.TypeConverters;
        }

        [Test]
        public void AddOrUpdate_ShouldAddNewConverter()
        {
            this.converters.AddOrUpdate((string value) => int.Parse(value, CultureInfo.InvariantCulture));

            Assert.That(this.converters.ConvertOrDefault(typeof(string), "123"), Is.TypeOf<int>());
        }

        [Test]
        public void AddOrUpdate_ShouldUpdateConverter()
        {
            this.converters.AddOrUpdate((string value) => int.Parse(value, CultureInfo.InvariantCulture));

            Assert.That(this.converters.ConvertOrDefault(typeof(string), "123"), Is.TypeOf<int>());

            this.converters.AddOrUpdate((string value) => value);

            Assert.That(this.converters.ConvertOrDefault(typeof(string), "123"), Is.TypeOf<string>());
        }

        [Test]
        public void ConvertOrDefault_ShouldReturnConvertedValue_WhenConverterExists()
        {
            this.converters.AddOrUpdate((string value) => int.Parse(value, CultureInfo.InvariantCulture));

            var result = this.converters.ConvertOrDefault(typeof(string), "123");

            Assert.That(result, Is.EqualTo(123));
        }

        [Test]
        public void ConvertOrDefault_ShouldNotThrow_WhenConverterExistsAndValueIsNull()
        {
            this.converters.AddOrUpdate((string value) => int.Parse(value, CultureInfo.InvariantCulture));

            var result = this.converters.ConvertOrDefault(typeof(string), null);

            Assert.That(result, Is.EqualTo(null));
        }

        [Test]
        public void ConvertOrDefault_ShouldReturnOriginalValue_WhenNoConverterExists()
        {
            var result = this.converters.ConvertOrDefault(typeof(string), "123");

            Assert.That(result, Is.EqualTo("123"));
        }

        private sealed class TestEntity
        {
        }
    }
}