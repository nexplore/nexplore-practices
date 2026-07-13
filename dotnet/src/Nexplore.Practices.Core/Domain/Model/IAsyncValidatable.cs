namespace Nexplore.Practices.Core.Domain.Model
{
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.Core.Validation;

    public interface IAsyncValidatable<in TValidationContext> : IValidatable
    {
        Task<IReadOnlyCollection<EntityValidationError>> ValidateAsync(TValidationContext context, CancellationToken cancellationToken);
    }
}
