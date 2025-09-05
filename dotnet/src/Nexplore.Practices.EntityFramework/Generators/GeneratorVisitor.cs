namespace Nexplore.Practices.EntityFramework.Generators
{
    using System;
    using System.Collections.ObjectModel;
    using System.Threading;
    using System.Threading.Tasks;
    using Autofac;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core.Generators;
    using Nexplore.Practices.EntityFramework.Configuration;

    public class GeneratorVisitor : IGeneratorVisitor
    {
        private readonly ILifetimeScope lifetimeScope;
        private readonly IOptions<DatabaseOptions> options;

        private readonly Collection<Type> alreadyRunGenerators = new Collection<Type>();
        private readonly Collection<Type> activeGenerators = new Collection<Type>();

        public GeneratorVisitor(ILifetimeScope lifetimeScope, IOptions<DatabaseOptions> options)
        {
            this.lifetimeScope = lifetimeScope;
            this.options = options;
        }

        public virtual bool CanActivate<TGenerator>()
            where TGenerator : IGenerator
        {
            var isTestDataGenerator = typeof(TGenerator).IsAssignableTo<ITestDataGenerator>();
            var testDataGeneratorEnabled = this.options.Value.ExecuteTestDataGenerators;

            var isSampleDataGenerator = typeof(TGenerator).IsAssignableTo<ISampleDataGenerator>();
            var sampleDataGeneratorEnabled = this.options.Value.ExecuteSampleDataGenerators;

            return (isTestDataGenerator, isSampleDataGenerator) switch
            {
                (isTestDataGenerator: true, isSampleDataGenerator: true) => testDataGeneratorEnabled || sampleDataGeneratorEnabled,
                (isTestDataGenerator: true, isSampleDataGenerator: false) => testDataGeneratorEnabled,
                (isTestDataGenerator: false, isSampleDataGenerator: true) => sampleDataGeneratorEnabled,
                _ => true
            };
        }

        public void SetActive<TGenerator>()
            where TGenerator : IGenerator
        {
            var generatorType = typeof(TGenerator);
            if (this.activeGenerators.Contains(generatorType))
            {
                throw new InvalidOperationException("Generator dependencies contain circles.");
            }

            this.activeGenerators.Add(generatorType);
        }

        public virtual async Task RunAsync<TGenerator>(CancellationToken cancellationToken)
            where TGenerator : IGenerator
        {
            var generatorType = typeof(TGenerator);
            if (!this.alreadyRunGenerators.Contains(generatorType))
            {
                var generator = (IGenerator)this.lifetimeScope.Resolve(generatorType);
                await generator.GenerateAsync(cancellationToken).ConfigureAwait(false);

                this.alreadyRunGenerators.Add(generatorType);
            }

            this.activeGenerators.Remove(generatorType);
        }
    }
}
