namespace Nexplore.Practices.EntityFramework.Generators
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Autofac;
    using Nexplore.Practices.Core.Generators;

    public class GeneratorRunner : IGeneratorRunner
    {
        private readonly ILifetimeScope lifetimeScope;

        public GeneratorRunner(ILifetimeScope lifetimeScope)
        {
            this.lifetimeScope = lifetimeScope;
        }

        public virtual async Task RunGeneratorAsync<TGenerator>(CancellationToken cancellationToken)
            where TGenerator : IGenerator
        {
            var dependencyNode = this.lifetimeScope.Resolve<IGeneratorDependencyNode<TGenerator>>();

            await this.ProcessAsync([dependencyNode], cancellationToken).ConfigureAwait(false);
        }

        public virtual async Task RunGeneratorsAsync(IEnumerable<Type> generatorTypes, CancellationToken cancellationToken)
        {
            var dependencyNodes = generatorTypes
                .Select(t => (IGeneratorDependencyNode)this.lifetimeScope.Resolve(typeof(IGeneratorDependencyNode<>).MakeGenericType(t)))
                .ToArray();

            await this.ProcessAsync(dependencyNodes, cancellationToken).ConfigureAwait(false);
        }

        public virtual async Task RunGeneratorsAsync<TGenerator>(CancellationToken cancellationToken)
            where TGenerator : IGenerator
        {
            var types = this.lifetimeScope.Resolve<IEnumerable<TGenerator>>().Select(e => e.GetType());

            await this.RunGeneratorsAsync(types, cancellationToken).ConfigureAwait(false);
        }

        private async Task ProcessAsync(IGeneratorDependencyNode[] dependencies, CancellationToken cancellationToken)
        {
            var visitor = this.lifetimeScope.Resolve<IGeneratorVisitor>();
            foreach (var dependency in dependencies)
            {
                await dependency.VisitAsync(visitor, cancellationToken).ConfigureAwait(false);
            }
        }
    }
}
