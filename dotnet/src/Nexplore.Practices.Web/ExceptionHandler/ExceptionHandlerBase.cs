namespace Nexplore.Practices.Web.ExceptionHandler
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Localization;
    using Nexplore.Practices.Core.Localization;
    using Nexplore.Practices.Web.Dtos.Errors;

    public abstract class ExceptionHandlerBase : ExceptionHandlerBase<ProblemDetails>
    {
        protected ExceptionHandlerBase(IStringLocalizerFactory stringLocalizerFactory, IProblemDetailsService problemDetailsService)
            : base(stringLocalizerFactory, problemDetailsService)
        {
        }
    }

    public abstract class ExceptionHandlerBase<TProblemDetails>
        where TProblemDetails : ProblemDetails, new()
    {
        private readonly IStringLocalizerFactory stringLocalizerFactory;
        private readonly IProblemDetailsService problemDetailsService;

        protected ExceptionHandlerBase(IStringLocalizerFactory stringLocalizerFactory, IProblemDetailsService problemDetailsService)
        {
            this.stringLocalizerFactory = stringLocalizerFactory;
            this.problemDetailsService = problemDetailsService;

            this.Localizer = this.stringLocalizerFactory.Create(typeof(PracticesResourceNames));
        }

        protected IStringLocalizer Localizer { get; }

        protected virtual bool IncludeFullExceptionDetails { get; }

        protected abstract int StatusCode { get; }

        public async ValueTask HandleErrorAsync(HttpContext httpContext, Exception exception, string message, CancellationToken cancellationToken)
        {
            var problemDetails = this.GetProblemDetails(httpContext, exception, message);

            httpContext.Response.StatusCode = this.StatusCode;
            if (this.problemDetailsService is null
                || !await this.problemDetailsService.TryWriteAsync(
                    new ProblemDetailsContext
                    {
                        HttpContext = httpContext,
                        ProblemDetails = problemDetails,
                    }).ConfigureAwait(false))
            {
                await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken).ConfigureAwait(false);
            }
        }

        protected virtual TProblemDetails GetProblemDetails(HttpContext httpContext, Exception exception, string message)
        {
            var problemDetails = new TProblemDetails
            {
                Title = this.Localizer[PracticesResourceNames.ERROR_TITLE_STATUS_CODE + this.StatusCode],
                Status = this.StatusCode,
                Detail = message,
                Instance = httpContext.Request.Path,
            };

            if (this.IncludeFullExceptionDetails)
            {
                problemDetails.SetOriginalMessage(exception.Message);
                problemDetails.SetStackTrace(exception.StackTrace);
            }

            return problemDetails;
        }
    }
}
