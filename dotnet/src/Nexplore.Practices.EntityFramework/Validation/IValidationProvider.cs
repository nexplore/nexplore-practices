namespace Nexplore.Practices.EntityFramework.Validation
{
    using System.Collections.Generic;
    using Nexplore.Practices.Core.Validation;

    public interface IValidationProvider
    {
        IEnumerable<EntityValidationResult> Validate(bool detectChangesOnChangeTracker = true);
    }
}
