namespace Nexplore.Practices.Core.Generators
{
    using System.Threading;
    using System.Threading.Tasks;

    public interface IGeneratorDependencyNode
    {
        Task VisitAsync(IGeneratorVisitor visitor, CancellationToken cancellationToken = default);
    }

    public interface IGeneratorDependencyNode<TGenerator> : IGeneratorDependencyNode
        where TGenerator : IGenerator
    {
    }
}
