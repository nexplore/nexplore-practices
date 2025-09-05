namespace Nexplore.Practices.Core.Extensions
{
    using System.Globalization;

    public static class StringExtensions
    {
        public static string FirstCharToLower(this string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return input;
            }

            if (input.Length == 1)
            {
                return input.ToLower(CultureInfo.CurrentCulture);
            }

            var firstChar = input[0].ToString(CultureInfo.CurrentCulture);
            var rest = input.Substring(1);

            return firstChar.ToLower(CultureInfo.CurrentCulture) + rest;
        }

        public static string FirstCharToUpper(this string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return input;
            }

            if (input.Length == 1)
            {
                return input.ToUpper(CultureInfo.CurrentCulture);
            }

            var firstChar = input[0].ToString(CultureInfo.CurrentCulture);
            var rest = input.Substring(1);

            return firstChar.ToUpper(CultureInfo.CurrentCulture) + rest;
        }
    }
}
