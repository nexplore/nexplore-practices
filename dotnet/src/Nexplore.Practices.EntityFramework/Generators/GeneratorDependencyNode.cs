namespace Nexplore.Practices.EntityFramework.Generators
{
    using System.Collections.ObjectModel;
    using System.Linq;
    using System.Reflection;
    using System.Threading;
    using System.Threading.Tasks;
    using Autofac;
    using Nexplore.Practices.Core.Generators;

    public class GeneratorDependencyNode<TGenerator> : IGeneratorDependencyNode<TGenerator>
        where TGenerator : IGenerator
    {
        private readonly ILifetimeScope lifetimeScope;

        public GeneratorDependencyNode(ILifetimeScope lifetimeScope)
        {
            this.lifetimeScope = lifetimeScope;
        }

        public async Task VisitAsync(IGeneratorVisitor visitor, CancellationToken cancellationToken)
        {
            if (!visitor.CanActivate<TGenerator>())
            {
                return;
            }

            visitor.SetActive<TGenerator>();

            var parentGeneratorDependencies = this.GetDependencies();
            foreach (var parentGeneratorDependency in parentGeneratorDependencies)
            {
                await parentGeneratorDependency.VisitAsync(visitor, cancellationToken).ConfigureAwait(false);
            }

            await visitor.RunAsync<TGenerator>(cancellationToken).ConfigureAwait(false);
        }

        private Collection<IGeneratorDependencyNode> GetDependencies()
        {
            var dependentNodes = new Collection<IGeneratorDependencyNode>();
            var parentGeneratorTypes = typeof(TGenerator).GetCustomAttributes<GeneratorDependencyAttribute>().Select(a => a.GeneratorType);
            foreach (var generatorType in parentGeneratorTypes)
            {
                dependentNodes.Add((IGeneratorDependencyNode)this.lifetimeScope.Resolve(typeof(IGeneratorDependencyNode<>).MakeGenericType(generatorType)));
            }

            return dependentNodes;
        }
    }
}
