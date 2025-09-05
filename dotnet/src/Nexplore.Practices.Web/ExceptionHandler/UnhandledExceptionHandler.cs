namespace Nexplore.Practices.Web.ExceptionHandler
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Diagnostics;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Localization;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core.Localization;
    using Nexplore.Practices.Core.Services;
    using Nexplore.Practices.Web.Configuration;
    using Nexplore.Practices.Web.Dtos.Errors;
    using Nexplore.Practices.Web.Filters;

    public class UnhandledExceptionHandler : ExceptionHandlerBase, IExceptionHandler
    {
        private readonly ILogger<UnhandledExceptionFilterAttribute> logger;
        private readonly IHttpRequestService httpRequestService;
        private readonly IOptions<ApiOptions> apiOptions;

        public UnhandledExceptionHandler(
            ILogger<UnhandledExceptionFilterAttribute> logger,
            IStringLocalizerFactory stringLocalizerFactory,
            IHttpRequestService httpRequestService,
            IOptions<ApiOptions> apiOptions,
            IProblemDetailsService problemDetailsService = null)
            : base(stringLocalizerFactory, problemDetailsService)
        {
            this.logger = logger;
            this.httpRequestService = httpRequestService;
            this.apiOptions = apiOptions;
        }

        protected override int StatusCode => StatusCodes.Status500InternalServerError;

        protected override bool IncludeFullExceptionDetails => this.apiOptions.Value.IncludeFullExceptionDetails;

        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            this.logger.LogError(exception, "Error while executing api request");

            var message = this.Localizer[PracticesResourceNames.UNHANDLED_EXCEPTION];
            await this.HandleErrorAsync(httpContext, exception, message, cancellationToken).ConfigureAwait(false);

            return true;
        }

        protected override ProblemDetails GetProblemDetails(HttpContext httpContext, Exception exception, string message)
        {
            var problemDetails = base.GetProblemDetails(httpContext, exception, message);

            var requestId = this.httpRequestService.GetRequestId();
            problemDetails.SetCorrelationId(requestId);

            return problemDetails;
        }
    }
}
