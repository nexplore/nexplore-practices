namespace Nexplore.Practices.Tests.Unit.Web.Localization
{
    using System;
    using System.Collections.Generic;
    using System.Globalization;
    using System.Linq;
    using Microsoft.Extensions.Localization;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Web.Localization;
    using NSubstitute;
    using NUnit.Framework;

    using LocalizationOptions = Nexplore.Practices.Web.Localization.LocalizationOptions;

    [TestFixture]
    public class ClientLocalizationServiceTests
    {
        private IStringLocalizerFactory stringLocalizerFactoryMock;
        private IOptions<LocalizationOptions> localizationOptionsMock;
        private ClientLocalizationService clientLocalizationService;

        [SetUp]
        public void Initialize()
        {
            this.stringLocalizerFactoryMock = Substitute.For<IStringLocalizerFactory>();
            this.localizationOptionsMock = Substitute.For<IOptions<LocalizationOptions>>();
            this.clientLocalizationService = new ClientLocalizationService(this.stringLocalizerFactoryMock, this.localizationOptionsMock);
        }

        [Test]
        public void GetLocalizationsFromCurrentUiCulture_WithNoConfiguredResourceTypes_ReturnsEmptyDictionary()
        {
            // Arrange
            var localizationOptions = new LocalizationOptions { ClientResourceTypes = Array.Empty<string>() };
            this.localizationOptionsMock.Value.Returns(localizationOptions);

            // Act
            var result = this.clientLocalizationService.GetLocalizationsForCulture(CultureInfo.InvariantCulture);

            // Assert
            Assert.That(result.Count, Is.EqualTo(0));
        }

        [Test]
        public void GetLocalizationsFromCurrentUiCulture_WithSingleResourceType_ReturnsDictionaryWithOneKey()
        {
            // Arrange
            var localizationOptions = new LocalizationOptions
            {
                ClientResourceTypes = new[]
                {
                    typeof(FirstTestResource).AssemblyQualifiedName,
                },
            };
            this.localizationOptionsMock.Value.Returns(localizationOptions);

            // Act
            var result = this.clientLocalizationService.GetLocalizationsForCulture(CultureInfo.InvariantCulture);

            // Assert
            Assert.That(result.Count, Is.EqualTo(1));
            Assert.That(result.First().Key, Is.EqualTo(nameof(FirstTestResource)));
        }

        [Test]
        public void GetLocalizationsFromCurrentUiCulture_WithTwoResourceTypes_ReturnsDictionaryWithTwoKeys()
        {
            // Arrange
            var localizationOptions = new LocalizationOptions
            {
                ClientResourceTypes = new[]
                {
                    typeof(FirstTestResource).AssemblyQualifiedName,
                    typeof(SecondTestResource).AssemblyQualifiedName,
                },
            };
            this.localizationOptionsMock.Value.Returns(localizationOptions);

            // Act
            var result = this.clientLocalizationService.GetLocalizationsForCulture(CultureInfo.InvariantCulture);

            // Assert
            Assert.That(result.Count, Is.EqualTo(2));
            Assert.That(result.Keys, Is.EquivalentTo(new[] { nameof(FirstTestResource), nameof(SecondTestResource) }));
        }

        [Test]
        public void GetLocalizationsFromCurrentUiCulture_WithInvalidResourceTypeValue_ThrowsArgumentException()
        {
            // Arrange
            var localizationOptions = new LocalizationOptions
            {
                ClientResourceTypes = new[]
                {
                    "InvalidType, InvalidAssembly",
                },
            };
            this.localizationOptionsMock.Value.Returns(localizationOptions);

            // Act
            TestDelegate act = () => this.clientLocalizationService.GetLocalizationsForCulture(CultureInfo.InvariantCulture);

            // Assert
            Assert.That(act, Throws.ArgumentException);
        }

        [Test]
        public void GetLocalizationsFromCurrentUiCulture_WithTranslationsInResource_ReturnsCorrectTranslations()
        {
            // Arrange
            var localizationOptions = new LocalizationOptions
            {
                ClientResourceTypes = new[]
                {
                    typeof(FirstTestResource).AssemblyQualifiedName,
                },
            };
            this.localizationOptionsMock.Value.Returns(localizationOptions);

            var localizations = new[]
            {
                new LocalizedString("Key1", "Value1"),
                new LocalizedString("Key2", "Value2"),
            };

            var stringLocalizerMock = Substitute.For<IStringLocalizer<FirstTestResource>>();
            stringLocalizerMock.GetAllStrings(true).Returns(localizations);

            this.stringLocalizerFactoryMock.Create(typeof(FirstTestResource)).Returns(stringLocalizerMock);

            // Act
            var result = this.clientLocalizationService.GetLocalizationsForCulture(CultureInfo.InvariantCulture);

            // Assert
            Assert.That(
                result.Values.First(),
                Is.EquivalentTo(new[]
                {
                    new KeyValuePair<string, string>("Key1", "Value1"),
                    new KeyValuePair<string, string>("Key2", "Value2"),
                }));
        }

        public class FirstTestResource
        {
        }

        public class SecondTestResource
        {
        }
    }
}
