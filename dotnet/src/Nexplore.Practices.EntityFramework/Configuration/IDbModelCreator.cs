namespace Nexplore.Practices.EntityFramework.Configuration
{
    using Microsoft.EntityFrameworkCore;

    public interface IDbModelCreator
    {
        void ConfigureConventions(ModelConfigurationBuilder configurationBuilder);

        void OnModelCreating(ModelBuilder builder);
    }
}