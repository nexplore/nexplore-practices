namespace Nexplore.Practices.EntityFramework.Generators
{
    using System.Threading;
    using System.Threading.Tasks;

    public interface IDataSeedingService
    {
        Task ExecuteAsync(CancellationToken cancellationToken = default);
    }
}
