namespace Nexplore.Practices.EntityFramework.Configuration
{
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Storage;

    public class DbContextTransactionFactory : IDbContextTransactionFactory
    {
        public IDbContextTransaction BeginTransaction(DbContext dbContext)
        {
            return dbContext.Database.BeginTransaction();
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync(DbContext dbContext, CancellationToken cancellationToken)
        {
            return await dbContext.Database.BeginTransactionAsync(cancellationToken).ConfigureAwait(false);
        }
    }
}
