namespace Nexplore.Practices.Tests.Unit.Core.Extensions
{
    using Nexplore.Practices.Core.Extensions;
    using NUnit.Framework;

    [TestFixture]
    public class StringExtensionsTests
    {
        [TestCase("alllowercase", ExpectedResult = "alllowercase")]
        [TestCase("ALLUPPERCASE", ExpectedResult = "aLLUPPERCASE")]
        [TestCase("camelCase", ExpectedResult = "camelCase")]
        [TestCase("CamelCase", ExpectedResult = "camelCase")]
        public string FirstCharToLower_WithInput_HasFirstCharacterInLowerCase(string input)
        {
            return input.FirstCharToLower();
        }

        [TestCase("alllowercase", ExpectedResult = "Alllowercase")]
        [TestCase("ALLUPPERCASE", ExpectedResult = "ALLUPPERCASE")]
        [TestCase("pascalCase", ExpectedResult = "PascalCase")]
        [TestCase("PascalCase", ExpectedResult = "PascalCase")]
        public string FirstCharToUpper_WithInput_HasFirstCharacterInUpperCase(string input)
        {
            return input.FirstCharToUpper();
        }
    }
}
