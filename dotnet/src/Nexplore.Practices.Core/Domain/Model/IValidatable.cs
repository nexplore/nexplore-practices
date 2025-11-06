namespace Nexplore.Practices.Core.Domain.Model
{
    using System.Collections.Generic;
    using System.Diagnostics.CodeAnalysis;
    using Nexplore.Practices.Core.Validation;

    [SuppressMessage("Microsoft.Design", "CA1040:AvoidEmptyInterfaces", Justification = "Used as marker for all validatable entities, generic and non generic types necessary.")]
    public interface IValidatable
    {
    }

    public interface IValidatable<in TValidationContext> : IValidatable
    {
        IEnumerable<EntityValidationError> Validate(TValidationContext context);
    }
}
