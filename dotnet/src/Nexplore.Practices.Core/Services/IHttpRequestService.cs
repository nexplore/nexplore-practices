namespace Nexplore.Practices.Core.Services
{
    using System;

    public interface IHttpRequestService
    {
        Guid? GetRequestId();
    }
}
