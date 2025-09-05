namespace Nexplore.Practices.Core.Services
{
    using System;

    public interface ISessionDataProvider
    {
        void Save(string key, object value, DateTime? expirationDate = null);

        TValue Load<TValue>(string key);

        void Delete(string key);

        void Clear();
    }
}
