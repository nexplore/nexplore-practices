namespace Nexplore.Practices.EntityFramework.Extensions
{
    using Autofac;
    using Microsoft.AspNetCore.DataProtection.KeyManagement;
    using Microsoft.AspNetCore.DataProtection.Repositories;
    using Microsoft.AspNetCore.DataProtection.XmlEncryption;
    using Microsoft.Extensions.Options;

    public static class DataProtectionExtensions
    {
        public static void AddDataProtectionKeysDbStorage(this ContainerBuilder builder)
        {
            builder.Register(GetDataprotectionOptions).SingleInstance();
        }

        private static IConfigureOptions<KeyManagementOptions> GetDataprotectionOptions(IComponentContext context)
        {
            return new ConfigureOptions<KeyManagementOptions>(options =>
            {
                options.XmlRepository = context.Resolve<IXmlRepository>();
                options.XmlEncryptor = context.Resolve<IXmlEncryptor>();
            });
        }
    }
}