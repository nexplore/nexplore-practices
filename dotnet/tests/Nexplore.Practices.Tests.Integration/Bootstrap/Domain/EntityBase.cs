namespace Nexplore.Practices.Tests.Integration.Bootstrap.Domain
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.Core.Domain.Model;
    using Nexplore.Practices.Core.Domain.Model.Audit;
    using Nexplore.Practices.Core.Validation;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Validation;

    public abstract class EntityBase : IEntity<Guid>, ITimestamped, IModificationMetadata, IValidatable<IValidationContext>, IAsyncValidatable<IValidationContext>, IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string CreatedBy { get; set; }

        public DateTimeOffset CreatedOn { get; set; }

        public string CreatedWith { get; set; }

        public string ModifiedBy { get; set; }

        public DateTimeOffset? ModifiedOn { get; set; }

        public string ModifiedWith { get; set; }

        public byte[] Timestamp { get; set; }

        public IEnumerable<EntityValidationError> Validate(IValidationContext context)
        {
            yield break;
        }

        public Task<IReadOnlyCollection<EntityValidationError>> ValidateAsync(IValidationContext context, CancellationToken cancellationToken)
        {
            return Task.FromResult((IReadOnlyCollection<EntityValidationError>)[]);
        }

        public string GetAuditKey()
        {
            return this.Id.ToString();
        }
    }
}
