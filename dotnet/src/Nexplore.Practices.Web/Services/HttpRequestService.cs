namespace Nexplore.Practices.Web.Services
{
    using System;
    using Microsoft.AspNetCore.Http;
    using Nexplore.Practices.Core.Services;

    public class HttpRequestService : IHttpRequestService
    {
        private const string REQUEST_ID_KEY = "RequestId";

        private readonly IHttpContextAccessor httpContextAccessor;

        public HttpRequestService(IHttpContextAccessor httpContextAccessor)
        {
            this.httpContextAccessor = httpContextAccessor;
        }

        public Guid? GetRequestId()
        {
            if (this.httpContextAccessor.HttpContext == null)
            {
                return default(Guid?);
            }

            return (Guid)(this.httpContextAccessor.HttpContext.Items[REQUEST_ID_KEY] ??
                           (this.httpContextAccessor.HttpContext.Items[REQUEST_ID_KEY] = Guid.NewGuid()));
        }
    }
}
