namespace Nexplore.Practices.Core.Generators
{
    using System.Threading;
    using System.Threading.Tasks;

    public interface IGenerator
    {
        Task GenerateAsync(CancellationToken cancellationToken = default);
    }
}
