namespace Nexplore.Practices.Core.Domain.Model.Audit
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.Core.Domain.Model.Audit.Entities;

    public interface IAuditHistoryRepository
    {
        void Add(AuditHistory history);

        Task<int> RemoveOlderThanAsync(DateTimeOffset referenceDate, CancellationToken cancellationToken = default);

        Task<AuditHistory[]> LoadAuditHistoryAsync(DateTimeOffset dateTimeFrom, DateTimeOffset dateTimeTo, CancellationToken cancellationToken = default);
    }
}
