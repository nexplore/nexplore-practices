namespace Nexplore.Practices.Core.Validation
{
    using System.Globalization;
    using System.Text;

    public class EntityValidationError
    {
        public EntityValidationError(string errorMessage, string propertyName = null)
        {
            this.ErrorMessage = errorMessage;
            this.PropertyName = propertyName;
        }

        public string ErrorMessage { get; }

        public string PropertyName { get; }

        public override string ToString()
        {
            var message = new StringBuilder();

            if (!string.IsNullOrEmpty(this.PropertyName))
            {
                message.Append(CultureInfo.InvariantCulture, $"PropertyName={this.PropertyName}, ");
            }

            message.Append(CultureInfo.InvariantCulture, $"ErrorMessage={this.ErrorMessage}");

            return message.ToString();
        }
    }
}
