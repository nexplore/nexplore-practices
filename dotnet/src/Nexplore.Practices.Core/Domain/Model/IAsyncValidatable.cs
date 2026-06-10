namespace Nexplore.Practices.Core.Domain.Model
{
    using System.Collections.Generic;
    using System.Diagnostics.CodeAnalysis;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.Core.Validation;

    [SuppressMessage("Microsoft.Design", "CA1040:AvoidEmptyInterfaces", Justification = "Used as marker for all validatable entities, generic and non generic types necessary.")]
    public interface IAsyncValidatable<in TValidationContext> : IValidatable
    {
        Task<IReadOnlyCollection<EntityValidationError>> ValidateAsync(TValidationContext context, CancellationToken cancellationToken);
    }
}
