namespace Nexplore.Practices.EntityFramework.Validation
{
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.Core.Validation;

    public interface IValidationProvider
    {
        Task<IReadOnlyCollection<EntityValidationResult>> ValidateAsync(bool detectChangesOnChangeTracker = true, CancellationToken cancellationToken = default);
    }
}
