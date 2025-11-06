namespace Nexplore.Practices.Tests.Unit.EntityFramework.Generators
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Autofac;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core.Generators;
    using Nexplore.Practices.EntityFramework.Configuration;
    using Nexplore.Practices.EntityFramework.Generators;
    using NUnit.Framework;

    [TestFixture]
    public class GeneratorDependencyNodeTests
    {
        private IContainer container;

        [OneTimeSetUp]
        public void Initialize()
        {
            var containerBuilder = new ContainerBuilder();

            containerBuilder.RegisterGeneric(typeof(GeneratorDependencyNode<>)).As(typeof(IGeneratorDependencyNode<>));

            containerBuilder.RegisterType<TestGenerator1>().AsSelf().InstancePerLifetimeScope();
            containerBuilder.RegisterType<TestGenerator2>().AsSelf().InstancePerLifetimeScope();
            containerBuilder.RegisterType<TestGenerator3>().AsSelf().InstancePerLifetimeScope();
            containerBuilder.RegisterType<SampleGenerator>().AsSelf().InstancePerLifetimeScope();
            containerBuilder.RegisterType<SampleAndTestGenerator>().AsSelf().InstancePerLifetimeScope();
            containerBuilder.RegisterType<TestDependentGenerator1>().AsSelf().InstancePerLifetimeScope();
            containerBuilder.RegisterType<TestDependentGenerator2>().AsSelf().InstancePerLifetimeScope();
            containerBuilder.RegisterType<TestCycleGenerator1>().AsSelf().InstancePerLifetimeScope();
            containerBuilder.RegisterType<TestCycleGenerator2>().AsSelf().InstancePerLifetimeScope();
            containerBuilder.RegisterType<TestSelfReferenceGenerator>().AsSelf().InstancePerLifetimeScope();

            this.container = containerBuilder.Build();
        }

        [OneTimeTearDown]
        public void Cleanup()
        {
            this.container.Dispose();
            this.container = null;
        }

        [Test]
        public async Task Visit_WithOneGenerator_RunsSuccessful()
        {
            // Arrange
            var scope = this.container.BeginLifetimeScope();
            var visitor = new GeneratorVisitorMock(scope, GetOptions());
            var node = new GeneratorDependencyNode<TestGenerator1>(scope);

            var generator = scope.Resolve<TestGenerator1>();

            // Act
            await node.VisitAsync(visitor, CancellationToken.None);

            // Assert
            Assert.That(generator.HasRun, Is.True);
        }

        [Test]
        public async Task Visit_WithOneDependent_RunsOnlyDependents()
        {
            // Arrange
            var scope = this.container.BeginLifetimeScope();
            var visitor = new GeneratorVisitorMock(scope, GetOptions());
            var node = new GeneratorDependencyNode<TestDependentGenerator1>(scope);

            var dependentGenerator = scope.Resolve<TestDependentGenerator1>();
            var testGenerator1 = scope.Resolve<TestGenerator1>();
            var testGenerator2 = scope.Resolve<TestGenerator2>();

            // Act
            await node.VisitAsync(visitor, CancellationToken.None);

            // Assert
            Assert.That(dependentGenerator.HasRun, Is.True);
            Assert.That(testGenerator1.HasRun, Is.True);
            Assert.That(testGenerator2.HasRun, Is.False);
        }

        [Test]
        public async Task Visit_WithOneDependent_RunsDependentsInCorrectOrder()
        {
            // Arrange
            var scope = this.container.BeginLifetimeScope();
            var visitor = new GeneratorVisitorMock(scope, GetOptions());
            var node = new GeneratorDependencyNode<TestDependentGenerator2>(scope);

            // Act
            await node.VisitAsync(visitor, CancellationToken.None);

            // Assert
            Assert.That(visitor.HasRun<TestGenerator1>(0), Is.True);
            Assert.That(visitor.HasRun<TestDependentGenerator1>(1), Is.True);
            Assert.That(visitor.HasRun<TestDependentGenerator2>(2), Is.True);
        }

        [Test]
        public void Visit_WithSelfReferencedGenerator_ThrowsException()
        {
            // Arrange
            var scope = this.container.BeginLifetimeScope();
            var visitor = new GeneratorVisitorMock(scope, GetOptions());
            var node = new GeneratorDependencyNode<TestSelfReferenceGenerator>(scope);

            // Act
            AsyncTestDelegate act = async () => await node.VisitAsync(visitor, CancellationToken.None);

            // Act
            Assert.That(act, Throws.Exception.TypeOf<InvalidOperationException>());
        }

        [Test]
        public void Visit_WithCycleDependent_ThrowsException()
        {
            // Arrange
            var scope = this.container.BeginLifetimeScope();
            var visitor = new GeneratorVisitorMock(scope, GetOptions());
            var node = new GeneratorDependencyNode<TestCycleGenerator1>(scope);

            // Act
            AsyncTestDelegate act = async () => await node.VisitAsync(visitor, CancellationToken.None);

            // Act
            Assert.That(act, Throws.Exception.TypeOf<InvalidOperationException>());
        }

        [Test]
        public async Task Visit_WithTestDataGeneratorEnabled_RunsGenerator()
        {
            // Arrange
            var scope = this.container.BeginLifetimeScope();
            var visitor = new GeneratorVisitorMock(scope, GetOptions(executeTestDataGenerators: true));
            var node = new GeneratorDependencyNode<TestGenerator3>(scope);

            var generator = scope.Resolve<TestGenerator3>();

            // Act
            await node.VisitAsync(visitor, CancellationToken.None);

            // Assert
            Assert.That(generator.HasRun, Is.True);
        }

        [Test]
        public async Task Visit_WithTestDataGeneratorDisabled_DoesNotRunGenerator()
        {
            // Arrange
            var scope = this.container.BeginLifetimeScope();
            var visitor = new GeneratorVisitorMock(scope, GetOptions(executeTestDataGenerators: false));
            var node = new GeneratorDependencyNode<TestGenerator3>(scope);

            var generator = scope.Resolve<TestGenerator3>();

            // Act
            await node.VisitAsync(visitor, CancellationToken.None);

            // Assert
            Assert.That(generator.HasRun, Is.False);
        }

        [Test]
        public async Task Visit_WithSampleDataGeneratorEnabled_RunsGenerator()
        {
            // Arrange
            var scope = this.container.BeginLifetimeScope();
            var visitor = new GeneratorVisitorMock(scope, GetOptions(executeSampleDataGenerators: true));
            var node = new GeneratorDependencyNode<SampleGenerator>(scope);

            var generator = scope.Resolve<SampleGenerator>();

            // Act
            await node.VisitAsync(visitor, CancellationToken.None);

            // Assert
            Assert.That(generator.HasRun, Is.True);
        }

        [Test]
        public async Task Visit_WithSampleDataGeneratorDisabled_DoesNotRunGenerator()
        {
            // Arrange
            var scope = this.container.BeginLifetimeScope();
            var visitor = new GeneratorVisitorMock(scope, GetOptions(executeSampleDataGenerators: false));
            var node = new GeneratorDependencyNode<SampleGenerator>(scope);

            var generator = scope.Resolve<SampleGenerator>();

            // Act
            await node.VisitAsync(visitor, CancellationToken.None);

            // Assert
            Assert.That(generator.HasRun, Is.False);
        }

        [Test]
        public async Task Visit_WithSampleDataGeneratorEnabled_RunsGeneratorWithBothSampleAndTestData()
        {
            // Arrange
            var scope = this.container.BeginLifetimeScope();
            var visitor = new GeneratorVisitorMock(scope, GetOptions(executeSampleDataGenerators: true));
            var node = new GeneratorDependencyNode<SampleAndTestGenerator>(scope);

            var generator = scope.Resolve<SampleAndTestGenerator>();

            // Act
            await node.VisitAsync(visitor, CancellationToken.None);

            // Assert
            Assert.That(generator.HasRun, Is.True);
        }

        [Test]
        public async Task Visit_WithTestDataGeneratorEnabled_RunsGeneratorWithBothSampleAndTestData()
        {
            // Arrange
            var scope = this.container.BeginLifetimeScope();
            var visitor = new GeneratorVisitorMock(scope, GetOptions(executeTestDataGenerators: true));
            var node = new GeneratorDependencyNode<SampleAndTestGenerator>(scope);

            var generator = scope.Resolve<SampleAndTestGenerator>();

            // Act
            await node.VisitAsync(visitor, CancellationToken.None);

            // Assert
            Assert.That(generator.HasRun, Is.True);
        }

        [Test]
        public async Task Visit_WithBothSampleAndTestDataGeneratorDisabled_DoesNotRunGenerator()
        {
            // Arrange
            var scope = this.container.BeginLifetimeScope();
            var visitor = new GeneratorVisitorMock(scope, GetOptions());
            var node = new GeneratorDependencyNode<SampleAndTestGenerator>(scope);

            var generator = scope.Resolve<SampleAndTestGenerator>();

            // Act
            await node.VisitAsync(visitor, CancellationToken.None);

            // Assert
            Assert.That(generator.HasRun, Is.False);
        }

        private static IOptions<DatabaseOptions> GetOptions(bool executeTestDataGenerators = false, bool executeSampleDataGenerators = false)
        {
            var options = new DatabaseOptions
            {
                ExecuteTestDataGenerators = executeTestDataGenerators,
                ExecuteSampleDataGenerators = executeSampleDataGenerators,
            };

            return Options.Create(options);
        }

        private sealed class TestGenerator1 : IMasterDataGenerator
        {
            public bool HasRun { get; private set; }

            public Task GenerateAsync(CancellationToken cancellationToken)
            {
                this.HasRun = true;

                return Task.CompletedTask;
            }
        }

        private sealed class TestGenerator2 : IMasterDataGenerator
        {
            public bool HasRun { get; private set; }

            public Task GenerateAsync(CancellationToken cancellationToken)
            {
                this.HasRun = true;

                return Task.CompletedTask;
            }
        }

        private sealed class TestGenerator3 : ITestDataGenerator
        {
            public bool HasRun { get; private set; }

            public Task GenerateAsync(CancellationToken cancellationToken)
            {
                this.HasRun = true;

                return Task.CompletedTask;
            }
        }

        private sealed class SampleGenerator : ISampleDataGenerator
        {
            public bool HasRun { get; private set; }

            public Task GenerateAsync(CancellationToken cancellationToken)
            {
                this.HasRun = true;

                return Task.CompletedTask;
            }
        }

        private sealed class SampleAndTestGenerator : ISampleDataGenerator, ITestDataGenerator
        {
            public bool HasRun { get; private set; }

            public Task GenerateAsync(CancellationToken cancellationToken)
            {
                this.HasRun = true;

                return Task.CompletedTask;
            }
        }

        [GeneratorDependency(typeof(TestGenerator1))]
        private sealed class TestDependentGenerator1 : IMasterDataGenerator
        {
            public bool HasRun { get; private set; }

            public Task GenerateAsync(CancellationToken cancellationToken)
            {
                this.HasRun = true;

                return Task.CompletedTask;
            }
        }

        [GeneratorDependency(typeof(TestDependentGenerator1))]
        private sealed class TestDependentGenerator2 : IMasterDataGenerator
        {
            public Task GenerateAsync(CancellationToken cancellationToken)
            {
                return Task.CompletedTask;
            }
        }

        [GeneratorDependency(typeof(TestCycleGenerator2))]
        private sealed class TestCycleGenerator1 : IMasterDataGenerator
        {
            public Task GenerateAsync(CancellationToken cancellationToken)
            {
                return Task.CompletedTask;
            }
        }

        [GeneratorDependency(typeof(TestCycleGenerator1))]
        private sealed class TestCycleGenerator2 : IMasterDataGenerator
        {
            public Task GenerateAsync(CancellationToken cancellationToken)
            {
                return Task.CompletedTask;
            }
        }

        [GeneratorDependency(typeof(TestSelfReferenceGenerator))]
        private sealed class TestSelfReferenceGenerator : IMasterDataGenerator
        {
            public Task GenerateAsync(CancellationToken cancellationToken)
            {
                return Task.CompletedTask;
            }
        }

        private sealed class GeneratorVisitorMock : GeneratorVisitor
        {
            private readonly List<Type> runnedGenerators;

            public GeneratorVisitorMock(ILifetimeScope lifetimeScope, IOptions<DatabaseOptions> options)
                : base(lifetimeScope, options)
            {
                this.runnedGenerators = new List<Type>();
            }

            public override async Task RunAsync<TGenerator>(CancellationToken cancellationToken)
            {
                await base.RunAsync<TGenerator>(cancellationToken);

                this.runnedGenerators.Add(typeof(TGenerator));
            }

            public bool HasRun<TGenerator>(int index)
            {
                return this.runnedGenerators.ElementAt(index) == typeof(TGenerator);
            }
        }
    }
}
