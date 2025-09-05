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
    using Nexplore.Practices.Core.Scopes;

    public class DataProtectionKeyRepository : IXmlRepository
    {
        private readonly ILogger<DataMisalignedException> logger;
        private readonly IUnitOfWorkFactory<DbSet<DataProtectionKey>> unitOfWorkFactory;

        public DataProtectionKeyRepository(ILogger<DataMisalignedException> logger, IUnitOfWorkFactory<DbSet<DataProtectionKey>> unitOfWorkFactory)
        {
            this.logger = logger;
            this.unitOfWorkFactory = unitOfWorkFactory;
        }

        public virtual IReadOnlyCollection<XElement> GetAllElements()
        {
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                return unitOfWork.Dependent.AsNoTracking().Select(key => TryParseKeyXml(key.Xml, this.logger)).ToList().AsReadOnly();
            }
        }

        public virtual void StoreElement(XElement element, string friendlyName)
        {
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var newKey = new DataProtectionKey
                {
                    FriendlyName = friendlyName,
                    Xml = element.ToString(SaveOptions.DisableFormatting),
                };

                unitOfWork.Dependent.Add(newKey);
                unitOfWork.SaveChanges();
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
