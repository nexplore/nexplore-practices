namespace Nexplore.Practices.Tests.Unit.EntityFramework.Validation
{
    using System.ComponentModel.DataAnnotations;
    using Microsoft.Extensions.Localization;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Logging.Abstractions;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core.Localization;
    using Nexplore.Practices.EntityFramework.Validation;
    using Nexplore.Practices.Web.Localization;
    using NUnit.Framework;
    using LocalizationOptions = Nexplore.Practices.Web.Localization.LocalizationOptions;

    [TestFixture]
    public class ValidationProviderTests
    {
        private static readonly string[] memberNamesWithOneProperty = new[] { "Property" };
        private static readonly string[] memberNamesWithTwoProperties = new[] { "Property1", "Property2" };

        [Test]
        public void GetLocalizedMessageOrDefault_WithUnknowMessage_ReturnsNull()
        {
            // Arrange
            var validationProvider = new ValidationProviderMock();
            var validationResult = new ValidationResult("Unknow message", memberNamesWithOneProperty);

            // Act
            var localizedMessage = validationProvider.GetLocalizedMessageOrDefaultExposer(validationResult);

            // Assert
            Assert.That(localizedMessage, Is.Null);
        }

        [Test]
        public void GetLocalizedMessageOrDefault_WithNoMemberName_ReturnsNull()
        {
            // Arrange
            var validationProvider = new ValidationProviderMock();
            var validationResult = new ValidationResult("Unknow message");

            // Act
            var localizedMessage = validationProvider.GetLocalizedMessageOrDefaultExposer(validationResult);

            // Assert
            Assert.That(localizedMessage, Is.Null);
        }

        [Test]
        public void GetLocalizedMessageOrDefault_WithMoreThanOneMemberName_ReturnsNull()
        {
            // Arrange
            var validationProvider = new ValidationProviderMock();
            var validationResult = new ValidationResult("Unknow message", memberNamesWithTwoProperties);

            // Act
            var localizedMessage = validationProvider.GetLocalizedMessageOrDefaultExposer(validationResult);

            // Assert
            Assert.That(localizedMessage, Is.Null);
        }

        [Test]
        public void GetLocalizedMessageOrDefault_WithRequiredMessage_ReturnsLocalizedText()
        {
            // Arrange
            var validationProvider = new ValidationProviderMock();
            var validationResult = new ValidationResult("The Property field is required.", memberNamesWithOneProperty);

            // Act
            var localizedMessage = validationProvider.GetLocalizedMessageOrDefaultExposer(validationResult);

            // Assert
            Assert.That(localizedMessage, Is.EqualTo(ValidationResourceNames.REQUIRED));
        }

        [Test]
        public void GetLocalizedMessageOrDefault_WithStringLengthMaxMessage_ReturnsLocalizedText()
        {
            // Arrange
            var validationProvider = new ValidationProviderMock();
            var validationResult = new ValidationResult("The field Property must be a string with a maximum length of 10.", memberNamesWithOneProperty);

            // Act
            var localizedMessage = validationProvider.GetLocalizedMessageOrDefaultExposer(validationResult);

            // Assert
            Assert.That(localizedMessage, Is.EqualTo(ValidationResourceNames.STRING_MAX_LENGTH));
        }

        [Test]
        public void GetLocalizedMessageOrDefault_WithStringLengthMinAndMaxMessage_ReturnsLocalizedText()
        {
            // Arrange
            var validationProvider = new ValidationProviderMock();
            var validationResult = new ValidationResult("The field Property must be a string with a minimum length of 5 and a maximum length of 10.", memberNamesWithOneProperty);

            // Act
            var localizedMessage = validationProvider.GetLocalizedMessageOrDefaultExposer(validationResult);

            // Assert
            Assert.That(localizedMessage, Is.EqualTo(ValidationResourceNames.STRING_MIN_AND_MAX_LENGTH));
        }

        [Test]
        public void GetLocalizedMessageOrDefault_WithMaxLengthMessage_ReturnsLocalizedText()
        {
            // Arrange
            var validationProvider = new ValidationProviderMock();
            var validationResult = new ValidationResult("The field Property must be a string or array type with a maximum length of '20'.", memberNamesWithOneProperty);

            // Act
            var localizedMessage = validationProvider.GetLocalizedMessageOrDefaultExposer(validationResult);

            // Assert
            Assert.That(localizedMessage, Is.EqualTo(ValidationResourceNames.MAX_LENGTH));
        }

        private sealed class ValidationProviderMock : ValidationProvider<object>
        {
            private static readonly IOptions<LocalizationOptions> options = Options.Create(new LocalizationOptions());
            private static readonly ILoggerFactory loggerFactory = new NullLoggerFactory();
            private static readonly ILogger<PracticesStringLocalizerFactory> logger = loggerFactory.CreateLogger<PracticesStringLocalizerFactory>();
            private static readonly IStringLocalizerFactory innerFactory = new ResourceManagerStringLocalizerFactory(options, loggerFactory);

            public ValidationProviderMock()
                : base(null, null, new PracticesStringLocalizerFactory(options, logger, innerFactory))
            {
            }

            public string GetLocalizedMessageOrDefaultExposer(ValidationResult result)
            {
                return this.GetLocalizedMessageOrDefault(result);
            }
        }
    }
}
