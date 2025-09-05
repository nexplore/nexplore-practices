namespace Nexplore.Practices.Core.Validation
{
    using System.ComponentModel.DataAnnotations;

    public class ValidationHelper : IValidationHelper
    {
        public bool IsValidEmail(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return false;
            }

            return new EmailAddressAttribute().IsValid(input);
        }
    }
}
