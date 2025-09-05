namespace Nexplore.Practices.EntityFramework.Services
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Extensions.Logging;
    using Nexplore.Practices.Core.Domain.Model.Audit;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.Core.Services;

    internal class AuditHistoryCleanupService : IAuditHistoryCleanupService
    {
        private readonly ILogger<AuditHistoryCleanupService> logger;
        private readonly IUnitOfWorkFactory<IAuditHistoryRepository> unitOfWorkFactory;

        public AuditHistoryCleanupService(
            ILogger<AuditHistoryCleanupService> logger,
            IUnitOfWorkFactory<IAuditHistoryRepository> unitOfWorkFactory)
        {
            this.logger = logger;
            this.unitOfWorkFactory = unitOfWorkFactory;
        }

        public async Task<int> CleanupAsync(DateTimeOffset cutoffDateTime, CancellationToken cancellationToken)
        {
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var removed = await unitOfWork.Dependent.RemoveOlderThanAsync(cutoffDateTime, cancellationToken).ConfigureAwait(false);

                await unitOfWork.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

                var message = $"Deleted {removed} audit log entries";
                this.logger.LogInformation($"Cleanup Service: {message}");

                return removed;
            }
        }
    }
}
