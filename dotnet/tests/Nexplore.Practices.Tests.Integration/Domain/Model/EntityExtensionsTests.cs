namespace Nexplore.Practices.Tests.Integration.Domain.Model
{
    using System;
    using System.Diagnostics.CodeAnalysis;
    using System.Reflection;
    using Autofac;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Infrastructure;
    using Microsoft.Extensions.Caching.Memory;
    using Nexplore.Practices.Core.Domain.Model;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.EntityFramework.Scopes;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities;
    using NUnit.Framework;

    [TestFixture]
    public class EntityExtensionsTests : ScopedTestsBase
    {
        private IUnitOfWorkFactory<ITestRepository> unitOfWorkFactory;

        [SetUp]
        public void Initialize()
        {
            this.unitOfWorkFactory = this.Scope.Resolve<IUnitOfWorkFactory<ITestRepository>>();
        }

        [Test]
        public void CreateEqualsExpression_WithDifferentIds_WillCacheTheGeneratedQueries()
        {
            // Arrange
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var memoryCache = GetMemoryCache(unitOfWork);
                memoryCache.Compact(1);

                var orginalCacheEntries = memoryCache.Count;

                // Act
                ExecuteQuery(unitOfWork.Dependent, new Guid("00000000-0000-0000-0000-000000000000"));
                ExecuteQuery(unitOfWork.Dependent, new Guid("11111111-1111-1111-1111-111111111111"));
                ExecuteQuery(unitOfWork.Dependent, new Guid("22222222-2222-2222-2222-222222222222"));

                // Assert
                var cacheEntries = memoryCache.Count;

                Assert.That(orginalCacheEntries, Is.EqualTo(0));
                Assert.That(cacheEntries, Is.EqualTo(2));
            }
        }

        private static void ExecuteQuery(ITestRepository testRepository, Guid id)
        {
            var expression = EntityExtensions.CreateEqualsExpression<TestEntity, Guid>(id);
            testRepository.GetBySingleOrDefault(expression);
        }

        [SuppressMessage("Microsoft.EntityFrameworkCore.Analyzers", "EF1001:Internal EF Core API usage", Justification = "Reviewed.")]

        private static MemoryCache GetMemoryCache(IUnitOfWork unitOfWork)
        {
            var dbContextField = typeof(UnitOfWork).GetField("context", BindingFlags.NonPublic | BindingFlags.Instance);
            var dbContext = (DbContext)dbContextField.GetValue(unitOfWork);

            var compiledQueryCache = (Microsoft.EntityFrameworkCore.Query.Internal.CompiledQueryCache)dbContext.GetService<Microsoft.EntityFrameworkCore.Query.Internal.ICompiledQueryCache>();
            var memoryCache = (MemoryCache)typeof(Microsoft.EntityFrameworkCore.Query.Internal.CompiledQueryCache).GetTypeInfo().GetField("_memoryCache", BindingFlags.Instance | BindingFlags.NonPublic).GetValue(compiledQueryCache);

            return memoryCache;
        }
    }
}
