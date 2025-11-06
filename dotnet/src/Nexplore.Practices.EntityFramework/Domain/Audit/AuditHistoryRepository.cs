namespace Nexplore.Practices.EntityFramework.Domain.Audit
{
    using System;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;
    using Nexplore.Practices.Core.Domain.Model.Audit;
    using Nexplore.Practices.Core.Domain.Model.Audit.Entities;
    using Nexplore.Practices.Core.Services;

    public class AuditHistoryRepository : IAuditHistoryRepository
    {
        private readonly DbSet<AuditHistory> set;
        private readonly IDbTimeoutService dbTimeoutService;

        public AuditHistoryRepository(DbSet<AuditHistory> set, IDbTimeoutService dbTimeoutService)
        {
            this.set = set;
            this.dbTimeoutService = dbTimeoutService;
        }

        public void Add(AuditHistory history)
        {
            this.set.Add(history);
        }

        public async Task<int> RemoveOlderThanAsync(DateTimeOffset referenceDate, CancellationToken cancellationToken)
        {
            using var largeTimeout = this.dbTimeoutService.UseLargeCommandTimeout();

            return await this.set.Where(a => a.CreatedOn < referenceDate).ExecuteDeleteAsync(cancellationToken).ConfigureAwait(false);
        }

        public Task<AuditHistory[]> LoadAuditHistoryAsync(DateTimeOffset dateTimeFrom, DateTimeOffset dateTimeTo, CancellationToken cancellationToken)
        {
            return this.set.Where(a => a.CreatedOn >= dateTimeFrom && a.CreatedOn <= dateTimeTo).ToArrayAsync(cancellationToken);
        }
    }
}
