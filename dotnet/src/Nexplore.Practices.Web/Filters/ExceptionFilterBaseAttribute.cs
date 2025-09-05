namespace Nexplore.Practices.Web.Filters
{
    using System.Net;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.Filters;
    using Microsoft.Extensions.Localization;
    using Nexplore.Practices.Core.Exceptions;
    using Nexplore.Practices.Core.Localization;
    using Nexplore.Practices.Web.Dtos.Errors;

    /// <summary>
    /// Base class for returning an ErrorDto with the given status code.
    /// </summary>
    public abstract class ExceptionFilterBaseAttribute : ExceptionFilterAttribute
    {
        private readonly IStringLocalizerFactory stringLocalizerFactory;
        private readonly IProblemDetailsService problemDetailsService;

        protected ExceptionFilterBaseAttribute(IStringLocalizerFactory stringLocalizerFactory, IProblemDetailsService problemDetailsService)
        {
            this.stringLocalizerFactory = stringLocalizerFactory;
            this.problemDetailsService = problemDetailsService;
        }

        protected virtual void SetErrorResponse(ExceptionContext context, HttpStatusCode statusCode)
        {
            string localizedMessage;
            if (context.Exception is BusinessException businessException)
            {
                localizedMessage = businessException.GetLocalizedMessage(this.stringLocalizerFactory);
            }
            else
            {
                var localizer = this.stringLocalizerFactory.Create(typeof(PracticesResourceNames));
                localizedMessage = localizer[PracticesResourceNames.UNHANDLED_EXCEPTION];
            }

            var dto = new ErrorDto
            {
                ErrorMessage = localizedMessage,
            };

            this.SetErrorResponse(context, dto, statusCode);
        }

        protected virtual void SetErrorResponse(ExceptionContext context, ErrorDto dto, HttpStatusCode statusCode)
        {
            if (this.problemDetailsService is null)
            {
                context.Result = new JsonResult(dto)
                {
                    StatusCode = (int)statusCode,
                };
            }
            else
            {
                var problemDetails = this.GetProblemDetails(context, dto, statusCode);
                context.Result = new JsonResult(problemDetails)
                {
                    StatusCode = (int)statusCode,
                };
            }

            context.ExceptionHandled = true;
        }

        protected virtual ProblemDetails GetProblemDetails(ExceptionContext context, ErrorDto dto, HttpStatusCode statusCode)
        {
            var localizer = this.stringLocalizerFactory.Create(typeof(PracticesResourceNames));
            var title = localizer[PracticesResourceNames.ERROR_TITLE_STATUS_CODE + (int)statusCode];

            var problemDetails = new ProblemDetails
            {
                Title = title,
                Status = (int)statusCode,
                Detail = dto.ErrorMessage,
                Instance = context.HttpContext.Request.Path,
            };

            if (dto.ErrorDetailMessage is not null)
            {
                problemDetails.SetOriginalMessage(dto.ErrorDetailMessage);
            }

            if (dto.ErrorDetailStackTrace is not null)
            {
                problemDetails.SetStackTrace(dto.ErrorDetailStackTrace);
            }

            if (dto.CorrelationId is not null)
            {
                problemDetails.SetCorrelationId(dto.CorrelationId);
            }

            return problemDetails;
        }
    }
}