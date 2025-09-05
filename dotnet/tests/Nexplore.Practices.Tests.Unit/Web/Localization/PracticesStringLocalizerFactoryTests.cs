namespace Nexplore.Practices.Tests.Unit.Web.Localization
{
    using Microsoft.Extensions.Localization;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Logging.Abstractions;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core.Localization;
    using Nexplore.Practices.Web.Localization;
    using NUnit.Framework;
    using LocalizationOptions = Nexplore.Practices.Web.Localization.LocalizationOptions;

    [TestFixture]
    public class PracticesStringLocalizerFactoryTests
    {
        [Test]
        public void Create_WithPracticesResourceNames_CanRewriteResourceFile()
        {
            // Arrange
            var options = new LocalizationOptions
            {
                RewriteResourceTypes = new[]
                {
                    new RewriteResourceTypeConfig
                    {
                        RewriteFrom = typeof(PracticesResourceNames).FullName,
                        RewriteTo = typeof(TestResource).AssemblyQualifiedName,
                    },
                },
            };

            var stringLocalizer = GetStringLocalizer<PracticesResourceNames>(options);

            // Act
            var result = stringLocalizer[PracticesResourceNames.UNHANDLED_EXCEPTION];

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ResourceNotFound, Is.EqualTo(false));
            Assert.That(result.Value, Is.EqualTo("Unhandled Exception from TestResource"));
        }

        [Test]
        public void Create_WithConfiguredFallback_CanFallbackResource()
        {
            // Arrange
            var options = new LocalizationOptions
            {
                RewriteResourceTypes = new[]
                {
                    new RewriteResourceTypeConfig
                    {
                        RewriteFrom = typeof(PracticesResourceNames).FullName,
                        RewriteTo = typeof(TestResource).AssemblyQualifiedName,
                        FallbackTo = typeof(FallbackResource).AssemblyQualifiedName,
                    },
                },
            };

            var stringLocalizer = GetStringLocalizer<PracticesResourceNames>(options);

            // Act
            var result = stringLocalizer[nameof(FallbackResource.Testfallback_OnlyFallback)];

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ResourceNotFound, Is.EqualTo(false));
            Assert.That(result.Value, Is.EqualTo("Fallback: Text available only in fallback"));
        }

        [Test]
        public void Create_WithTemplateInResource_CanFormatResource()
        {
            // Arrange
            var options = new LocalizationOptions();
            var stringLocalizer = GetStringLocalizer<TestResource>(options);

            // Act
            var result = stringLocalizer[nameof(TestResource.TemplateFormat), ("bar", "Bar")];

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ResourceNotFound, Is.EqualTo(false));
            Assert.That(result.Value, Is.EqualTo("Foo Bar"));
        }

        private static IStringLocalizer GetStringLocalizer<TResource>(LocalizationOptions localizationOptions)
        {
            var options = Options.Create(localizationOptions);

            var loggerFactory = new NullLoggerFactory();
            var logger = loggerFactory.CreateLogger<PracticesStringLocalizerFactory>();

            var innerFactory = new ResourceManagerStringLocalizerFactory(options, loggerFactory);
            var stringLocalizerFactory = new PracticesStringLocalizerFactory(options, logger, innerFactory);
            return stringLocalizerFactory.Create(typeof(TResource));
        }
    }
}
