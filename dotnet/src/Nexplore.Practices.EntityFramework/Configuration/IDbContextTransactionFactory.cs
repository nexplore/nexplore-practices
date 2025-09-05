namespace Nexplore.Practices.EntityFramework.Configuration
{
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Storage;

    public interface IDbContextTransactionFactory
    {
        IDbContextTransaction BeginTransaction(DbContext dbContext);

        Task<IDbContextTransaction> BeginTransactionAsync(DbContext dbContext, CancellationToken cancellationToken = default);
    }
}
