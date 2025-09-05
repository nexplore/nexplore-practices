namespace Nexplore.Practices.EntityFramework.Configuration
{
    using Microsoft.EntityFrameworkCore;

    public interface IDbContextOptionsProvider
    {
        void OnConfiguring(DbContextOptionsBuilder builder);
    }
}