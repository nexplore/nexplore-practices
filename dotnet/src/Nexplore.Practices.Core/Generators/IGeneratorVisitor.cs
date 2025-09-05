namespace Nexplore.Practices.Core.Generators
{
    using System.Threading;
    using System.Threading.Tasks;

    public interface IGeneratorVisitor
    {
        bool CanActivate<TGenerator>()
            where TGenerator : IGenerator;

        void SetActive<TGenerator>()
            where TGenerator : IGenerator;

        Task RunAsync<TGenerator>(CancellationToken cancellationToken = default)
            where TGenerator : IGenerator;
    }
}
