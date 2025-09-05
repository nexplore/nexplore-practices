namespace Nexplore.Practices.Web.Services
{
    using System;
    using System.Linq;
    using Microsoft.AspNetCore.Http;
    using Nexplore.Practices.Core.Services;

    public class CookieService : ICookieService
    {
        private readonly IHttpContextAccessor httpContextAccessor;

        public CookieService(IHttpContextAccessor httpContextAccessor)
        {
            this.httpContextAccessor = httpContextAccessor;
        }

        public void IssueCookie(string key, string value, DateTime? expiryDate = null)
        {
            if (this.httpContextAccessor.HttpContext == null)
            {
                return;
            }

            // if we don't have a value and there's no prior cookie then exit
            if (value == null && this.httpContextAccessor.HttpContext.Request.Cookies.Keys.All(cookieName => cookieName != key))
            {
                return;
            }

            var cookieOptions = new CookieOptions
            {
                // don't allow javascript access to the cookie
                HttpOnly = true,

                // set the path so other apps on the same server don't see the cookie
                Path = DefaultCookiePath(this.httpContextAccessor.HttpContext.Request),

                // ideally we're always going over SSL, but be flexible for non-SSL apps
                Secure = this.httpContextAccessor.HttpContext.Request.IsHttps,
            };

            // If we don't have a value but already a cookie, remove it
            if (value == null)
            {
                this.httpContextAccessor.HttpContext.Response.Cookies.Delete(key, cookieOptions);
                return;
            }

            if (expiryDate.HasValue)
            {
                // to keep the default expiry date, set expiry property only if the date actually is set
                cookieOptions.Expires = expiryDate.Value;
            }

            this.httpContextAccessor.HttpContext.Response.Cookies.Append(key, value, cookieOptions);
        }

        public string GetCookieValue(string key)
        {
            if (this.httpContextAccessor.HttpContext == null)
            {
                return null;
            }

            this.httpContextAccessor.HttpContext.Request.Cookies.TryGetValue(key, out var value);
            return value;
        }

        public void ClearCookies()
        {
            if (this.httpContextAccessor.HttpContext == null)
            {
                return;
            }

            foreach (var cookieKey in this.httpContextAccessor.HttpContext.Request.Cookies.Keys)
            {
                this.IssueCookie(cookieKey, null);
            }
        }

        private static string DefaultCookiePath(HttpRequest httpRequest)
        {
            return !string.IsNullOrWhiteSpace(httpRequest.PathBase) ? httpRequest.PathBase.Value : "/";
        }
    }
}
