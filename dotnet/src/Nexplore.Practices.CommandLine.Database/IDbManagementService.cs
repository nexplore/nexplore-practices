namespace Nexplore.Practices.CommandLine.Database
{
    using System.Threading.Tasks;

    public interface IDbManagementService
    {
        Task MigrateAsync();
    }
}
