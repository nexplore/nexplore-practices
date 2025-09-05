namespace Nexplore.Practices.Core.Exceptions
{
    using System;
    using Microsoft.Extensions.Localization;

    /// <summary>
    /// Represents business and domain exceptions that will be displayed to the user and must be translated.
    /// </summary>
    public abstract class BusinessException : Exception
    {
        private readonly Type resourceType;

        private readonly string resourceName;

        private readonly object[] resourceArguments;

        protected BusinessException(string localizedMessage)
            : base(localizedMessage)
        {
        }

        protected BusinessException(string localizedMessage, Exception innerException)
            : base(localizedMessage, innerException)
        {
        }

        protected BusinessException(Type resourceType, string resourceName, params object[] resourceArguments)
            : this(resourceName)
        {
            this.resourceType = resourceType;
            this.resourceName = resourceName;
            this.resourceArguments = resourceArguments;
        }

        protected BusinessException(Type resourceType, string resourceName, Exception innerException, params object[] resourceArguments)
            : this(resourceName, innerException)
        {
            this.resourceType = resourceType;
            this.resourceName = resourceName;
            this.resourceArguments = resourceArguments;
        }

        public string GetLocalizedMessage(IStringLocalizerFactory localizerFactory)
        {
            if (this.resourceType == null || this.resourceName == null)
            {
                return this.Message;
            }

            var localizer = localizerFactory.Create(this.resourceType);
            return localizer.GetString(this.resourceName, this.resourceArguments);
        }
    }
}
