namespace Nexplore.Practices.Tests.Unit.Core.Validation
{
    using Nexplore.Practices.Core.Validation;
    using NUnit.Framework;

    public class ValidationHelperTests
    {
        [TestCase("", ExpectedResult = false)]
        [TestCase(null, ExpectedResult = false)]
        [TestCase("test", ExpectedResult = false)]
        [TestCase("test@test", ExpectedResult = true)]
        [TestCase("test@test.com", ExpectedResult = true)]
        public bool IsValidEmail_WithSpecificInput_ReturnsCorrectResult(string input)
        {
            // Arrange
            var service = new ValidationHelper();

            // Act
            var result = service.IsValidEmail(input);

            // Assert
            return result;
        }
    }
}
