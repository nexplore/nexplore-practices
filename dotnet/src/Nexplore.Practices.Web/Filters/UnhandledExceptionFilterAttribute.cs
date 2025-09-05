namespace Nexplore.Practices.Web.Filters
{
    using System.Net;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc.Filters;
    using Microsoft.Extensions.Localization;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core.Services;
    using Nexplore.Practices.Web.Configuration;
    using Nexplore.Practices.Web.Dtos.Errors;

    /// <summary>
    /// Handles every exception that is unhandled to this point.
    /// </summary>
    public class UnhandledExceptionFilterAttribute : ExceptionFilterBaseAttribute
    {
        private readonly ILogger<UnhandledExceptionFilterAttribute> logger;
        private readonly IHttpRequestService httpRequestService;
        private readonly IOptions<ApiOptions> apiOptions;

        public UnhandledExceptionFilterAttribute(
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

        public override void OnException(ExceptionContext context)
        {
            this.logger.LogError(context.Exception, "Error while executing api request");

            this.SetErrorResponse(context, HttpStatusCode.InternalServerError);
        }

        protected override void SetErrorResponse(ExceptionContext context, ErrorDto dto, HttpStatusCode statusCode)
        {
            dto.CorrelationId = this.httpRequestService.GetRequestId();

            if (this.apiOptions.Value.IncludeFullExceptionDetails)
            {
                dto.ErrorDetailMessage = context.Exception.Message;
                dto.ErrorDetailStackTrace = context.Exception.StackTrace;
            }

            base.SetErrorResponse(context, dto, statusCode);
        }
    }
}
