namespace Nexplore.Practices.Web.ExceptionHandler
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Diagnostics;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Localization;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core.Exceptions;
    using Nexplore.Practices.Core.Localization;
    using Nexplore.Practices.Web.Configuration;

    public class EntityValidationExceptionHandler : BusinessExceptionHandler<HttpValidationProblemDetails>, IExceptionHandler
    {
        private readonly IStringLocalizer domainModelLocalizer;
        private readonly IOptions<ApiOptions> apiOptions;

        public EntityValidationExceptionHandler(IStringLocalizerFactory stringLocalizerFactory, IOptions<ApiOptions> apiOptions = null, IProblemDetailsService problemDetailsService = null)
            : base(stringLocalizerFactory, problemDetailsService)
        {
            this.apiOptions = apiOptions;

            this.domainModelLocalizer = stringLocalizerFactory.Create(typeof(DomainModelResourceNames));
        }

        protected override int StatusCode => this.apiOptions?.Value.ValidationErrorStatusCode ?? StatusCodes.Status400BadRequest;

        public override async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            if (exception is EntityValidationException)
            {
                return await base.TryHandleAsync(httpContext, exception, cancellationToken).ConfigureAwait(false);
            }

            return false;
        }

        protected override HttpValidationProblemDetails GetProblemDetails(HttpContext httpContext, Exception exception, string message)
        {
            var problemDetails = base.GetProblemDetails(httpContext, exception, message);

            if (exception is EntityValidationException entityValidationException)
            {
                problemDetails.Errors = this.GetErrors(entityValidationException)
                    .GroupBy(e => e.Name)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            }

            return problemDetails;
        }

        private IEnumerable<(string Name, string ErrorMessage)> GetErrors(EntityValidationException entityValidationException)
        {
            foreach (var validationResult in entityValidationException.ValidationResults)
            {
                foreach (var validationError in validationResult.ValidationErrors)
                {
                    var name = !string.IsNullOrEmpty(validationError.PropertyName)
                        ? this.domainModelLocalizer[$"{validationResult.GetEntityName()}_{validationError.PropertyName}"]
                        : this.domainModelLocalizer[validationResult.GetEntityName()];

                    yield return (name, validationError.ErrorMessage);
                }
            }
        }
    }
}
