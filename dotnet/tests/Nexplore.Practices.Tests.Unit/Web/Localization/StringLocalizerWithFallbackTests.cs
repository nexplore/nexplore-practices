namespace Nexplore.Practices.Tests.Unit.Web.Localization
{
    using System.Linq;
    using Microsoft.Extensions.Localization;
    using Microsoft.Extensions.Logging.Abstractions;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Web.Localization;
    using NUnit.Framework;
    using LocalizationOptions = Microsoft.Extensions.Localization.LocalizationOptions;

    [TestFixture]
    public class StringLocalizerWithFallbackTests
    {
        private StringLocalizerWithFallback<TestResource, FallbackResource> stringLocalizer;

        [SetUp]
        public void Initialize()
        {
            var options = new LocalizationOptions();
            var factory = new ResourceManagerStringLocalizerFactory(Options.Create(options), new NullLoggerFactory());

            this.stringLocalizer = new StringLocalizerWithFallback<TestResource, FallbackResource>(factory);
        }

        [Test]
        public void Indexer_WithResourceInBothFiles_ReturnsFromSource()
        {
            // Act
            var result = this.stringLocalizer[nameof(TestResource.Testfallback_Both)];

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ResourceNotFound, Is.EqualTo(false));
            Assert.That(result.Value, Is.EqualTo("Source: Text available in both files"));
        }

        [Test]
        public void Indexer_WithResourceOnlyInSource_ReturnsFromSource()
        {
            // Act
            var result = this.stringLocalizer[nameof(TestResource.Testfallback_OnlyInTest)];

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ResourceNotFound, Is.EqualTo(false));
            Assert.That(result.Value, Is.EqualTo("Source: Text available only in test"));
        }

        [Test]
        public void Indexer_WithResourceOnlyInFallback_ReturnsFromFallback()
        {
            // Act
            var result = this.stringLocalizer[nameof(FallbackResource.Testfallback_OnlyFallback)];

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ResourceNotFound, Is.EqualTo(false));
            Assert.That(result.Value, Is.EqualTo("Fallback: Text available only in fallback"));
        }

        [Test]
        public void Indexer_WithResourceNotAvailable_ReturnsKey()
        {
            // Arrange
            var key = "not_available";

            // Act
            var result = this.stringLocalizer[key];

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ResourceNotFound, Is.EqualTo(true));
            Assert.That(result.Value, Is.EqualTo(key));
        }

        [Test]
        public void GetAllStrings_WithFallbackResource_ReturnsAllStrings()
        {
            // Act
            var result = this.stringLocalizer.GetAllStrings().ToList();

            // Assert
            Assert.That(result, Is.Not.Null);

            var onlySource = result.Where(r => r.Name == nameof(TestResource.Testfallback_OnlyInTest)).ToArray();
            Assert.That(onlySource.Length, Is.EqualTo(1));
            Assert.That(onlySource[0].SearchedLocation, Is.EqualTo("Nexplore.Practices.Tests.Unit.Web.Localization.TestResource"));

            var onylFallback = result.Where(r => r.Name == nameof(FallbackResource.Testfallback_OnlyFallback)).ToArray();
            Assert.That(onylFallback.Length, Is.EqualTo(1));
            Assert.That(onylFallback[0].SearchedLocation, Is.EqualTo("Nexplore.Practices.Tests.Unit.Web.Localization.FallbackResource"));

            var both = result.Where(r => r.Name == nameof(FallbackResource.Testfallback_Both)).ToArray();
            Assert.That(both.Length, Is.EqualTo(2));
            Assert.That(both[0].SearchedLocation, Is.EqualTo("Nexplore.Practices.Tests.Unit.Web.Localization.TestResource"));
            Assert.That(both[1].SearchedLocation, Is.EqualTo("Nexplore.Practices.Tests.Unit.Web.Localization.FallbackResource"));
        }
    }
}
