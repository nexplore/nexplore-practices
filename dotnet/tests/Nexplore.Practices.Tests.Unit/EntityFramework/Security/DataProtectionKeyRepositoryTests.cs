namespace Nexplore.Practices.Tests.Unit.EntityFramework.Security
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using System.Xml.Linq;
    using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Storage;
    using Microsoft.Extensions.Logging.Abstractions;
    using Nexplore.Practices.EntityFramework.Configuration;
    using Nexplore.Practices.EntityFramework.Security;
    using NSubstitute;
    using NUnit.Framework;

    [TestFixture]
    public class DataProtectionKeyRepositoryTests
    {
        [Test]
        public void StoreElement_WithAsyncOnlyDbContext_PersistsKey()
        {
            // Arrange
            var databaseName = Guid.NewGuid().ToString();
            var dbContextFactory = Substitute.For<IDbContextFactory>();
            dbContextFactory.Create(Arg.Any<IDbContextTransaction>()).Returns(_ => CreateDataProtectionContext(databaseName));

            var repository = new DataProtectionKeyRepository(NullLogger<DataMisalignedException>.Instance, dbContextFactory);
            var element = XElement.Parse("<key id=\"test-key\" />");

            // Act
            repository.StoreElement(element, "test-friendly-name");

            // Assert
            using (var dataContext = CreateDataProtectionContext(databaseName))
            {
                var key = dataContext.Set<DataProtectionKey>().SingleAsync().ConfigureAwait(false).GetAwaiter().GetResult();

                Assert.That(key.FriendlyName, Is.EqualTo("test-friendly-name"));
                Assert.That(key.Xml, Is.EqualTo(element.ToString(SaveOptions.DisableFormatting)));
            }
        }

        private static TestDataProtectionContext CreateDataProtectionContext(string databaseName)
        {
            var options = new DbContextOptionsBuilder<TestDataProtectionContext>()
                .UseInMemoryDatabase(databaseName)
                .Options;

            return new TestDataProtectionContext(options);
        }

        private sealed class TestDataProtectionContext : DbContext, IDataProtectionKeyContext
        {
            public TestDataProtectionContext(DbContextOptions<TestDataProtectionContext> options)
                : base(options)
            {
            }

            public DbSet<DataProtectionKey> DataProtectionKeys { get; set; }

            public override int SaveChanges(bool acceptAllChangesOnSuccess)
            {
                throw new NotSupportedException("Synchronous save is not supported anymore, use SaveChangesAsync.");
            }

            public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
            {
                return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
            }
        }
    }
}
