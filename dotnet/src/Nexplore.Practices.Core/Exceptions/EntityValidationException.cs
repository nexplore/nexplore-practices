namespace Nexplore.Practices.Core.Exceptions
{
    using System;
    using System.Collections.Generic;
    using Nexplore.Practices.Core.Localization;
    using Nexplore.Practices.Core.Validation;

    public class EntityValidationException : BusinessException
    {
        public EntityValidationException(IReadOnlyCollection<EntityValidationResult> validationResults)
            : base(typeof(PracticesResourceNames), PracticesResourceNames.VALIDATION_EXCEPTION)
        {
            this.ValidationResults = validationResults ?? Array.Empty<EntityValidationResult>();
        }

        public IReadOnlyCollection<EntityValidationResult> ValidationResults { get; }

        public override string Message
        {
            get
            {
                var errorsMessages = string.Join(Environment.NewLine, this.ValidationResults);
                return base.Message + Environment.NewLine + errorsMessages;
            }
        }
    }
}
