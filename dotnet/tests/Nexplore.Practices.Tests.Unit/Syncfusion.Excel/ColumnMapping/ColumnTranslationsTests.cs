namespace Nexplore.Practices.Tests.Unit.Syncfusion.Excel.ColumnMapping
{
    using Nexplore.Practices.Syncfusion.Excel.ColumnMapping;
    using Nexplore.Practices.Syncfusion.Excel.Config;
    using NUnit.Framework;

    [TestFixture]
    public class ColumnTranslationsTests
    {
        private IColumnTranslations<TestEntity> translations;

        [SetUp]
        public void SetUp()
        {
            var config = new ExportConfig<TestEntity>();
            this.translations = config.Translations;
        }

        [Test]
        public void AddOrUpdate_ShouldAddNewTranslation()
        {
            const string propertyName = nameof(TestEntity.Property1);
            const string translation = "Translation";
            this.translations.AddOrUpdate(e => e.Property1, translation);

            Assert.That(this.translations.GetOrDefault(propertyName), Is.EqualTo(translation));
        }

        [Test]
        public void AddOrUpdate_ShouldUpdateConverter()
        {
            const string propertyName = nameof(TestEntity.Property1);
            const string translation = "Translation";
            this.translations.AddOrUpdate(e => e.Property1, translation);

            Assert.That(this.translations.GetOrDefault(propertyName), Is.EqualTo(translation));

            const string anotherTranslation = "AnotherTranslation";
            this.translations.AddOrUpdate(e => e.Property1, anotherTranslation);

            Assert.That(this.translations.GetOrDefault(propertyName), Is.EqualTo(anotherTranslation));
        }

        [Test]
        public void GetOrDefault_ShouldReturnPropertyName_WhenTranslationNotFound()
        {
            const string propertyName = nameof(TestEntity.Property1);

            var result = this.translations.GetOrDefault(propertyName);

            Assert.That(result, Is.EqualTo(propertyName));
        }

        [Test]
        public void HasTranslationFor_ShouldReturnTrue_WhenTranslationExists()
        {
            this.translations.AddOrUpdate(e => e.Property1, "Translation");

            Assert.That(this.translations.HasTranslationFor(nameof(TestEntity.Property1)), Is.True);
        }

        [Test]
        public void HasTranslationFor_ShouldReturnFalse_WhenNoTranslationExists()
        {
            Assert.That(this.translations.HasTranslationFor(nameof(TestEntity.Property1)), Is.False);
        }

        internal sealed class TestEntity
        {
            public string Property1 { get; set; }
        }
    }
}