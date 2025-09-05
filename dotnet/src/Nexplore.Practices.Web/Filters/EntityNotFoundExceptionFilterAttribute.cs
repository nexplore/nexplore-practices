namespace Nexplore.Practices.Web.Filters
{
    using System.Net;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc.Filters;
    using Microsoft.Extensions.Localization;
    using Nexplore.Practices.Core.Exceptions;

    public class EntityNotFoundExceptionFilterAttribute : ExceptionFilterBaseAttribute
    {
        public EntityNotFoundExceptionFilterAttribute(IStringLocalizerFactory stringLocalizerFactory, IProblemDetailsService problemDetailsService = null)
            : base(stringLocalizerFactory, problemDetailsService)
        {
        }

        public override void OnException(ExceptionContext context)
        {
            if (context.Exception is EntityNotFoundException)
            {
                this.SetErrorResponse(context, HttpStatusCode.NotFound);
            }
        }
    }
}
