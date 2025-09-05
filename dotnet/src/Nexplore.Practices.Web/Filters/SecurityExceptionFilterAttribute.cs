namespace Nexplore.Practices.Web.Filters
{
    using System.Net;
    using System.Security;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc.Filters;
    using Microsoft.Extensions.Localization;
    using Nexplore.Practices.Core.Localization;
    using Nexplore.Practices.Web.Dtos.Errors;

    public class SecurityExceptionFilterAttribute : ExceptionFilterBaseAttribute
    {
        private readonly IStringLocalizerFactory stringLocalizerFactory;

        public SecurityExceptionFilterAttribute(IStringLocalizerFactory stringLocalizerFactory, IProblemDetailsService problemDetailsService = null)
            : base(stringLocalizerFactory, problemDetailsService)
        {
            this.stringLocalizerFactory = stringLocalizerFactory;
        }

        public override void OnException(ExceptionContext context)
        {
            if (context.Exception is SecurityException)
            {
                var localizer = this.stringLocalizerFactory.Create(typeof(PracticesResourceNames));
                const HttpStatusCode forbiddenStatusCode = HttpStatusCode.Forbidden;

                var dto = new ErrorDto
                {
                    ErrorMessage = localizer[PracticesResourceNames.ERROR_STATUS_CODE + (int)forbiddenStatusCode],
                };

                this.SetErrorResponse(context, dto, forbiddenStatusCode);
            }
        }
    }
}
