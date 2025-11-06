namespace Nexplore.Practices.Web.ExceptionHandler
{
    using System;
    using System.Security;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Diagnostics;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Localization;
    using Nexplore.Practices.Core.Localization;

    public class SecurityExceptionHandler : ExceptionHandlerBase, IExceptionHandler
    {
        public SecurityExceptionHandler(IStringLocalizerFactory stringLocalizerFactory, IProblemDetailsService problemDetailsService = null)
            : base(stringLocalizerFactory, problemDetailsService)
        {
        }

        protected override int StatusCode => StatusCodes.Status403Forbidden;

        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            if (exception is SecurityException)
            {
                var message = this.Localizer[PracticesResourceNames.ERROR_STATUS_CODE + this.StatusCode];

                await this.HandleErrorAsync(httpContext, exception, message, cancellationToken).ConfigureAwait(false);

                return true;
            }

            return false;
        }
    }
}
