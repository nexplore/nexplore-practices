namespace Nexplore.Practices.Tests.Unit.EntityFramework.Security
{
    using System;
    using System.Xml.Linq;
    using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging.Abstractions;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.EntityFramework.Configuration;
    using Nexplore.Practices.EntityFramework.Security;
    using NUnit.Framework;

    [TestFixture]
    public class DataProtectionKeyRepositoryTests
    {
        [Test]
        public void StoreElement_WithPlainDataProtectionContext_PersistsKeySynchronously()
        {
            // Arrange
            var databaseName = Guid.NewGuid().ToString();
            var contextOptionsProvider = new InMemoryContextOptionsProvider(databaseName);
            var modelCreator = new DataProtectionTestModelCreator();
            var repository = new DataProtectionKeyRepository(
                NullLogger<DataMisalignedException>.Instance,
                contextOptionsProvider,
                modelCreator,
                Options.Create(new DatabaseOptions()));
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

        private sealed class InMemoryContextOptionsProvider : IDbContextOptionsProvider
        {
            private readonly string databaseName;

            public InMemoryContextOptionsProvider(string databaseName)
            {
                this.databaseName = databaseName;
            }

            public void OnConfiguring(DbContextOptionsBuilder builder)
            {
                builder.UseInMemoryDatabase(this.databaseName);
            }
        }

        private sealed class DataProtectionTestModelCreator : IDbModelCreator
        {
            public void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
            {
            }

            public void OnModelCreating(ModelBuilder builder)
            {
                builder.Entity<DataProtectionKey>();
            }
        }

        private sealed class TestDataProtectionContext : DbContext, IDataProtectionKeyContext
        {
            public TestDataProtectionContext(DbContextOptions<TestDataProtectionContext> options)
                : base(options)
            {
            }

            public DbSet<DataProtectionKey> DataProtectionKeys { get; set; }
        }
    }
}
