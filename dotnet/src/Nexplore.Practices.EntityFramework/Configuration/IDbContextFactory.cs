namespace Nexplore.Practices.EntityFramework.Configuration
{
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Storage;

    public interface IDbContextFactory
    {
        DbContext Create(IDbContextTransaction existingTransaction = null);
    }
}
