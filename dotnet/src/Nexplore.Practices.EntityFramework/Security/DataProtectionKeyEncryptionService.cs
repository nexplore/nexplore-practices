namespace Nexplore.Practices.EntityFramework.Security
{
    using System;
    using System.Linq;
    using System.Xml.Linq;
    using Microsoft.AspNetCore.DataProtection.XmlEncryption;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core;
    using Nexplore.Practices.Core.Security.Cryptography;
    using Nexplore.Practices.EntityFramework.Configuration;

    /// <summary>
    /// Service to encrypt/decrypt data protection keys. The cration of this class (the decryptor)
    /// is not DI enabled, therefore it's not possible to use a custom constructor and use DI there.
    ///
    /// For more information, see: https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/extensibility/key-management#ixmldecryptor.
    /// </summary>
    public sealed class DataProtectionKeyEncryptionService : IXmlEncryptor, IXmlDecryptor
    {
        private const string VALUE_ELEMENT_NAME = "value";
        private const string IV_ELEMENT_NAME = "iv";

        private readonly IOptions<DatabaseOptions> options;
        private readonly IEncryptionService encryptionService;

        public DataProtectionKeyEncryptionService(IServiceProvider services)
        {
            this.options = services.GetRequiredService<IOptions<DatabaseOptions>>();
            this.encryptionService = services.GetRequiredService<IEncryptionService>();
        }

        public EncryptedXmlInfo Encrypt(XElement plaintextElement)
        {
            Guard.ArgumentNotNull(plaintextElement, nameof(plaintextElement));

            var encryptedElement = plaintextElement;
            var password = this.options.Value.DataProtectionEncryptionPassword;

            // Encrypt value
            var valueNode = encryptedElement.Element(VALUE_ELEMENT_NAME);
            if (valueNode == null)
            {
                throw new InvalidOperationException($"Provided element has no '{VALUE_ELEMENT_NAME}' child");
            }

            valueNode.Value = this.encryptionService.EncryptDataAes(valueNode.Value, password, out byte[] iv);

            // Add initialization vector
            encryptedElement.Add(new XElement(IV_ELEMENT_NAME, Convert.ToBase64String(iv)));

            // Remove comment if available
            encryptedElement.DescendantNodes().OfType<XComment>().Remove();

            return new EncryptedXmlInfo(encryptedElement, typeof(DataProtectionKeyEncryptionService));
        }

        public XElement Decrypt(XElement encryptedElement)
        {
            Guard.ArgumentNotNull(encryptedElement, nameof(encryptedElement));

            var plaintextElement = encryptedElement;
            var password = this.options.Value.DataProtectionEncryptionPassword;

            // Decrypt value
            var valueNode = plaintextElement.Element(VALUE_ELEMENT_NAME);
            if (valueNode == null)
            {
                throw new InvalidOperationException($"Provided element has no '{VALUE_ELEMENT_NAME}' child");
            }

            var ivNode = plaintextElement.Element(IV_ELEMENT_NAME);
            if (ivNode == null)
            {
                throw new InvalidOperationException($"Provided element has no '{IV_ELEMENT_NAME}' child");
            }

            valueNode.Value = this.encryptionService.DecryptDataAes(valueNode.Value, password, Convert.FromBase64String(ivNode.Value));

            // Remove initialization vector node
            plaintextElement.Descendants().Where(e => e.Name.LocalName == IV_ELEMENT_NAME).Remove();

            return plaintextElement;
        }
    }
}
