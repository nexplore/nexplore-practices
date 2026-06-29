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
    using Nexplore.Practices.EntityFramework.Configuration;

    public class DataProtectionKeyRepository : IXmlRepository
    {
        private readonly ILogger<DataMisalignedException> logger;
        private readonly IDbContextFactory dbContextFactory;

        public DataProtectionKeyRepository(ILogger<DataMisalignedException> logger, IDbContextFactory dbContextFactory)
        {
            this.logger = logger;
            this.dbContextFactory = dbContextFactory;
        }

        public virtual IReadOnlyCollection<XElement> GetAllElements()
        {
            using (var dataContext = this.dbContextFactory.Create())
            {
                return dataContext.Set<DataProtectionKey>().AsNoTracking().Select(key => TryParseKeyXml(key.Xml, this.logger)).ToList().AsReadOnly();
            }
        }

        public virtual void StoreElement(XElement element, string friendlyName)
        {
            using (var dataContext = this.dbContextFactory.Create())
            {
                var newKey = new DataProtectionKey
                {
                    FriendlyName = friendlyName,
                    Xml = element.ToString(SaveOptions.DisableFormatting),
                };

                dataContext.Set<DataProtectionKey>().Add(newKey);
                dataContext.SaveChangesAsync().ConfigureAwait(false).GetAwaiter().GetResult();
            }
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
    }
}
