namespace Nexplore.Practices.Tests.Unit.Syncfusion.Excel.ColumnMapping
{
    using System;
    using System.Linq;
    using System.Linq.Expressions;
    using Nexplore.Practices.Syncfusion.Excel.ColumnMapping;
    using Nexplore.Practices.Syncfusion.Excel.Config;
    using NUnit.Framework;

    [TestFixture]
    public class ColumnValueConvertersTests
    {
        private IColumnValueConverters<TestEntity> converters;

        [SetUp]
        public void SetUp()
        {
            var config = new ExportConfig<TestEntity>();
            this.converters = config.ValueConverters;
        }

        [Test]
        public void AddOrUpdate_ShouldAddNewConverter()
        {
            Expression<Func<TestEntity, string>> propertySelector = entity => entity.Property1;

            this.converters.AddOrUpdate(propertySelector, int.Parse);

            Assert.That(this.converters.HasConverterFor(nameof(TestEntity.Property1)), Is.True);
        }

        [Test]
        public void AddOrUpdate_ShouldUpdateConverter()
        {
            Expression<Func<TestEntity, string>> propertySelector = entity => entity.Property1;

            this.converters.AddOrUpdate(propertySelector, int.Parse);

            Assert.That(this.converters.ConvertOrDefault(new TestEntity(), nameof(TestEntity.Property1), "123"), Is.EqualTo(123));

            this.converters.AddOrUpdate(propertySelector, value => value.Reverse());

            Assert.That(this.converters.ConvertOrDefault(new TestEntity(), nameof(TestEntity.Property1), "123"), Is.EqualTo("321"));
        }

        [Test]
        public void ConvertOrDefault_ShouldReturnConvertedValue_WhenConverterExists()
        {
            Expression<Func<TestEntity, string>> propertySelector = entity => entity.Property1;
            this.converters.AddOrUpdate(propertySelector, int.Parse);

            var result = this.converters.ConvertOrDefault(new TestEntity(), nameof(TestEntity.Property1), "123");

            Assert.That(result, Is.EqualTo(123));
        }

        [Test]
        public void ConvertOrDefault_ShouldNotThrow_WhenConverterExistsAndValueIsNull()
        {
            Expression<Func<TestEntity, string>> propertySelector = entity => entity.Property1;
            this.converters.AddOrUpdate(propertySelector, int.Parse);

            var result = this.converters.ConvertOrDefault(new TestEntity(), nameof(TestEntity.Property1), null);

            Assert.That(result, Is.EqualTo(null));
        }

        [Test]
        public void ConvertOrDefault_ShouldReturnOriginalValue_WhenNoConverterExists()
        {
            var result = this.converters.ConvertOrDefault(new TestEntity(), nameof(TestEntity.Property1), "123");

            Assert.That(result, Is.EqualTo("123"));
        }

        [Test]
        public void HasConverterFor_ShouldReturnTrue_WhenConverterExists()
        {
            Expression<Func<TestEntity, string>> propertySelector = entity => entity.Property1;
            this.converters.AddOrUpdate(propertySelector, int.Parse);

            Assert.That(this.converters.HasConverterFor(nameof(TestEntity.Property1)), Is.True);
        }

        [Test]
        public void HasConverterFor_ShouldReturnFalse_WhenNoConverterExists()
        {
            Assert.That(this.converters.HasConverterFor(nameof(TestEntity.Property1)), Is.False);
        }

        [Test]
        public void ConverterWithContext_CanUseOtherValues()
        {
            Expression<Func<TestEntity, string>> propertySelector = entity => entity.Property1;

            Func<TestEntity, string, string> converter = (entity, input) => entity.Property2 ? "Property 2 was set to true" : input;

            this.converters.AddOrUpdate(propertySelector, converter);

            var resultTrue = this.converters.ConvertOrDefault(new TestEntity
            {
                Property1 = "123",
                Property2 = true
            }, nameof(TestEntity.Property1), "123");

            Assert.That(resultTrue, Is.EqualTo("Property 2 was set to true"));

            var resultFalse = this.converters.ConvertOrDefault(new TestEntity
            {
                Property1 = "123",
                Property2 = false
            }, nameof(TestEntity.Property1), "123");

            Assert.That(resultFalse, Is.EqualTo("123"));
        }

        private sealed class TestEntity
        {
            public string Property1 { get; set; }

            public bool Property2 { get; set; }
        }
    }
}
