namespace Nexplore.Practices.Tests.Integration.EntityFramework.Query
{
    using System;
    using System.Linq;
    using System.Linq.Expressions;
    using System.Threading.Tasks;
    using Autofac;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities;
    using NUnit.Framework;

    [TestFixture]
    public class QueryableExtensionsTests : ScopedTestsBase
    {
        private IUnitOfWorkFactory<ITestRepository> unitOfWorkFactory;

        [SetUp]
        public void Initialize()
        {
            this.unitOfWorkFactory = this.Scope.Resolve<IUnitOfWorkFactory<ITestRepository>>();
        }

        [Test]
        public async Task ApplyIncludes_WithIncludesByString_ReturnsEntityWithDependencies()
        {
            // Arrange
            var entityId = await this.CreateEntityWithChildAndGrandChildAsync();

            var includes = "Children.Children";

            // Act
            TestEntity entity;
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // "ApplyIncludes" is called from "GetBySingleOrDefaultAsync"
                entity = await unitOfWork.Dependent.GetBySingleOrDefaultAsync(e => e.Id == entityId, includes: includes);
            }

            // Assert
            Assert.That(entity, Is.Not.Null);
            Assert.That(entity.Children.Count, Is.EqualTo(1));
            Assert.That(entity.Children.First().Children.Count, Is.EqualTo(1));
        }

        [Test]
        public async Task ApplyIncludes_WithIncludesByExpression_ReturnsEntityWithDependencies()
        {
            // Arrange
            var entityId = await this.CreateEntityWithChildAndGrandChildAsync();

            Expression<Func<TestEntity, object>> includes = e => e.Children.Select(c => c.Children);

            // Act
            TestEntity entity;
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // "ApplyIncludes" is called from "GetBySingleOrDefaultAsync"
                entity = await unitOfWork.Dependent.GetBySingleOrDefaultAsync(e => e.Id == entityId, includes: includes);
            }

            // Assert
            Assert.That(entity, Is.Not.Null);
            Assert.That(entity.Children.Count, Is.EqualTo(1));
            Assert.That(entity.Children.First().Children.Count, Is.EqualTo(1));
        }

        private async Task<Guid> CreateEntityWithChildAndGrandChildAsync()
        {
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var parent = unitOfWork.Dependent.CreateAndAdd();
                var child = unitOfWork.Dependent.CreateAndAdd();
                var grandChild = unitOfWork.Dependent.CreateAndAdd();

                parent.Children.Add(child);
                child.Children.Add(grandChild);

                await unitOfWork.SaveChangesAsync();

                return parent.Id;
            }
        }
    }
}
