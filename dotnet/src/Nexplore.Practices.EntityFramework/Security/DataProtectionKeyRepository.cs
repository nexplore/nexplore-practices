namespace Nexplore.Practices.EntityFramework.Security
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Xml.Linq;
    using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
    using Microsoft.AspNetCore.DataProtection.Repositories;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.EntityFramework.Configuration;

    public class DataProtectionKeyRepository : IXmlRepository
    {
        private readonly ILogger<DataMisalignedException> logger;
        private readonly IDbContextOptionsProvider contextOptionsProvider;
        private readonly IDbModelCreator modelCreator;
        private readonly IOptions<DatabaseOptions> databaseOptions;

        public DataProtectionKeyRepository(
            ILogger<DataMisalignedException> logger,
            IDbContextOptionsProvider contextOptionsProvider,
            IDbModelCreator modelCreator,
            IOptions<DatabaseOptions> databaseOptions)
        {
            this.logger = logger;
            this.contextOptionsProvider = contextOptionsProvider;
            this.modelCreator = modelCreator;
            this.databaseOptions = databaseOptions;
        }

        public virtual IReadOnlyCollection<XElement> GetAllElements()
        {
            using (var dataContext = this.CreateDataProtectionContext())
            {
                return dataContext.Set<DataProtectionKey>().AsNoTracking().Select(key => TryParseKeyXml(key.Xml, this.logger)).ToList().AsReadOnly();
            }
        }

        public virtual void StoreElement(XElement element, string friendlyName)
        {
            using (var dataContext = this.CreateDataProtectionContext())
            {
                var newKey = new DataProtectionKey
                {
                    FriendlyName = friendlyName,
                    Xml = element.ToString(SaveOptions.DisableFormatting),
                };

                dataContext.Set<DataProtectionKey>().Add(newKey);
                dataContext.SaveChanges();
            }
        }

        protected virtual DbContext CreateDataProtectionContext()
        {
            var context = new DataProtectionDbContext(this.contextOptionsProvider, this.modelCreator);
            context.ChangeTracker.AutoDetectChangesEnabled = this.databaseOptions.Value.AutoDetectChangesEnabled;
            return context;
        }

        private static XElement TryParseKeyXml(string xml, ILogger logger)
        {
            try
            {
                return XElement.Parse(xml);
            }
            catch (Exception exception)
            {
                logger?.LogError(exception, "Could not parse xml");
                return null;
            }
        }

        private sealed class DataProtectionDbContext : DbContext, IDataProtectionKeyContext
        {
            private readonly IDbContextOptionsProvider contextOptionsProvider;
            private readonly IDbModelCreator modelCreator;

            public DataProtectionDbContext(IDbContextOptionsProvider contextOptionsProvider, IDbModelCreator modelCreator)
            {
                this.contextOptionsProvider = contextOptionsProvider;
                this.modelCreator = modelCreator;
            }

            public DbSet<DataProtectionKey> DataProtectionKeys { get; set; }

            protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
            {
                this.contextOptionsProvider.OnConfiguring(optionsBuilder);
            }

            protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
            {
                this.modelCreator.ConfigureConventions(configurationBuilder);
            }

            protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                this.modelCreator.OnModelCreating(modelBuilder);
            }
        }
    }
}
