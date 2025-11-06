namespace Nexplore.Practices.Core.Services
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;

    public interface IAuditHistoryCleanupService
    {
        Task<int> CleanupAsync(DateTimeOffset cutoffDateTime, CancellationToken cancellationToken = default);
    }
}
