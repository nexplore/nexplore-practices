namespace Nexplore.Practices.Web.ExceptionHandler
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Diagnostics;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Localization;
    using Nexplore.Practices.Core.Exceptions;

    public class EntityNotFoundExceptionHandler : BusinessExceptionHandler, IExceptionHandler
    {
        public EntityNotFoundExceptionHandler(IStringLocalizerFactory stringLocalizerFactory, IProblemDetailsService problemDetailsService = null)
            : base(stringLocalizerFactory, problemDetailsService)
        {
        }

        protected override int StatusCode => StatusCodes.Status404NotFound;

        public override async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            if (exception is EntityNotFoundException)
            {
                return await base.TryHandleAsync(httpContext, exception, cancellationToken).ConfigureAwait(false);
            }

            return false;
        }
    }
}
