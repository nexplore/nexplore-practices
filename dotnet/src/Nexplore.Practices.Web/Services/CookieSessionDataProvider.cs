namespace Nexplore.Practices.Web.Services
{
    using System;
    using System.IO;
    using System.IO.Compression;
    using System.Security.Cryptography;
    using System.Text.Json;
    using Microsoft.AspNetCore.DataProtection;
    using Microsoft.Extensions.Logging;
    using Nexplore.Practices.Core;
    using Nexplore.Practices.Core.Services;

    /// <summary>
    /// Stores data in a cookies. Be sure to have data protection api enabled.
    /// </summary>
    public class CookieSessionDataProvider : ISessionDataProvider
    {
        private readonly ICookieService cookieService;
        private readonly ILogger<CookieSessionDataProvider> logger;

        private readonly Lazy<IDataProtector> dataProtector;

        public CookieSessionDataProvider(ICookieService cookieService, ILogger<CookieSessionDataProvider> logger, IDataProtectionProvider dataProtectionProvider)
        {
            this.cookieService = cookieService;
            this.logger = logger;

            this.dataProtector = new Lazy<IDataProtector>(() => dataProtectionProvider.CreateProtector(nameof(CookieSessionDataProvider)));
        }

        public void Save(string key, object value, DateTime? expirationDate = null)
        {
            Guard.ArgumentNotNull(key, nameof(key));
            Guard.ArgumentNotNull(value, nameof(value));

            var bytes = Serialize(value);
            bytes = Compress(bytes);

            var stringValue = this.Protect(bytes);
            if (stringValue != null)
            {
                this.cookieService.IssueCookie(key, stringValue, expirationDate);
            }
        }

        public TValue Load<TValue>(string key)
        {
            Guard.ArgumentNotNull(key, nameof(key));

            var value = this.cookieService.GetCookieValue(key);
            var bytes = this.Unprotect(value);
            if (bytes == null && value != null)
            {
                // failure, so remove cookie
                this.cookieService.IssueCookie(key, null);
                return default(TValue);
            }

            bytes = Decompress(bytes);

            return this.Deserialize<TValue>(bytes);
        }

        public void Delete(string key)
        {
            Guard.ArgumentNotNull(key, nameof(key));

            this.cookieService.IssueCookie(key, null);
        }

        public void Clear()
        {
            this.cookieService.ClearCookies();
        }

        private static byte[] Serialize(object data)
        {
            if (data == null)
            {
                return null;
            }

            return JsonSerializer.SerializeToUtf8Bytes(data);
        }

        private TValue Deserialize<TValue>(byte[] data)
        {
            if (data == null || data.Length == 0)
            {
                return default(TValue);
            }

            try
            {
                return JsonSerializer.Deserialize<TValue>(data);
            }
            catch (JsonException exception)
            {
                this.logger.LogError(exception, "Could not deserialize cookie value");
                return default(TValue);
            }
        }

        private static byte[] Compress(byte[] data)
        {
            if (data == null || data.Length == 0)
            {
                return null;
            }

            using var input = new MemoryStream(data);
            using var output = new MemoryStream();
            using (var stream = new DeflateStream(output, CompressionMode.Compress))
            {
                input.CopyTo(stream);
            }

            return output.ToArray();
        }

        private static byte[] Decompress(byte[] data)
        {
            if (data == null || data.Length == 0)
            {
                return null;
            }

            using var input = new MemoryStream(data);
            using var output = new MemoryStream();
            using (var stream = new DeflateStream(input, CompressionMode.Decompress))
            {
                stream.CopyTo(output);
            }

            return output.ToArray();
        }

        private string Protect(byte[] data)
        {
            if (data == null || data.Length == 0)
            {
                return null;
            }

            try
            {
                var value = this.dataProtector.Value.Protect(data);

                return Convert.ToBase64String(value);
            }
            catch (CryptographicException exception)
            {
                this.logger.LogError(exception, "Could not protect cookie value");
                return null;
            }
        }

        private byte[] Unprotect(string data)
        {
            if (string.IsNullOrWhiteSpace(data))
            {
                return null;
            }

            var bytes = Convert.FromBase64String(data);

            try
            {
                return this.dataProtector.Value.Unprotect(bytes);
            }
            catch (CryptographicException exception)
            {
                this.logger.LogError(exception, "Could not unprotect cookie value");
                return null;
            }
        }
    }
}
