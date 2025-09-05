namespace Nexplore.Practices.Web.Filters
{
    using System.Net;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc.Filters;
    using Microsoft.Extensions.Localization;
    using Nexplore.Practices.Core.Exceptions;

    /// <summary>
    /// Handles every BusinessException that is unhandled to this point.
    /// </summary>
    public class BusinessExceptionFilterAttribute : ExceptionFilterBaseAttribute
    {
        public BusinessExceptionFilterAttribute(IStringLocalizerFactory stringLocalizerFactory, IProblemDetailsService problemDetailsService = null)
            : base(stringLocalizerFactory, problemDetailsService)
        {
        }

        public override void OnException(ExceptionContext context)
        {
            if (context.Exception is BusinessException)
            {
                this.SetErrorResponse(context, HttpStatusCode.BadRequest);
            }
        }
    }
}
