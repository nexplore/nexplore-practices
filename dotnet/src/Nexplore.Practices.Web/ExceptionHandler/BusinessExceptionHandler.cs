namespace Nexplore.Practices.Web.ExceptionHandler
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Diagnostics;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Localization;
    using Nexplore.Practices.Core.Exceptions;

    public class BusinessExceptionHandler : BusinessExceptionHandler<ProblemDetails>
    {
        public BusinessExceptionHandler(IStringLocalizerFactory stringLocalizerFactory, IProblemDetailsService problemDetailsService = null)
            : base(stringLocalizerFactory, problemDetailsService)
        {
        }
    }

    public class BusinessExceptionHandler<TProblemDetails> : ExceptionHandlerBase<TProblemDetails>, IExceptionHandler
    where TProblemDetails : ProblemDetails, new()
    {
        private readonly IStringLocalizerFactory stringLocalizerFactory;

        public BusinessExceptionHandler(IStringLocalizerFactory stringLocalizerFactory, IProblemDetailsService problemDetailsService = null)
            : base(stringLocalizerFactory, problemDetailsService)
        {
            this.stringLocalizerFactory = stringLocalizerFactory;
        }

        protected override int StatusCode => StatusCodes.Status400BadRequest;

        public virtual async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            if (exception is BusinessException businessException)
            {
                var localizedMessage = businessException.GetLocalizedMessage(this.stringLocalizerFactory);

                await this.HandleErrorAsync(httpContext, businessException, localizedMessage, cancellationToken).ConfigureAwait(false);

                return true;
            }

            return false;
        }
    }
}
