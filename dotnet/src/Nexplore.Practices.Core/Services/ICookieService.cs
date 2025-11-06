namespace Nexplore.Practices.Core.Services
{
    using System;

    public interface ICookieService
    {
        void IssueCookie(string key, string value, DateTime? expiryDate = null);

        string GetCookieValue(string key);

        void ClearCookies();
    }
}
