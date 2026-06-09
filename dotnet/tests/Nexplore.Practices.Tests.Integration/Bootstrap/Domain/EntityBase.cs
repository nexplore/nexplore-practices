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

    public abstract class EntityBase : IEntity<Guid>, ITimestamped, IModificationMetadata, IValidatable<IValidationContext>, IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string CreatedBy { get; set; }

        public DateTimeOffset CreatedOn { get; set; }

        public string CreatedWith { get; set; }

        public string ModifiedBy { get; set; }

        public DateTimeOffset? ModifiedOn { get; set; }

        public string ModifiedWith { get; set; }

        public byte[] Timestamp { get; set; }

        public async Task<IReadOnlyCollection<EntityValidationError>> ValidateAsync(IValidationContext context, CancellationToken cancellationToken)
        {
            return await Task.FromResult(Array.Empty<EntityValidationError>());
        }

        public string GetAuditKey()
        {
            return this.Id.ToString();
        }
    }
}
