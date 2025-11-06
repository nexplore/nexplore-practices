namespace Nexplore.Practices.Web.Filters
{
    using System.Net;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.Filters;
    using Microsoft.Extensions.Localization;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core.Exceptions;
    using Nexplore.Practices.Core.Localization;
    using Nexplore.Practices.Core.Validation;
    using Nexplore.Practices.Web.Configuration;
    using Nexplore.Practices.Web.Dtos.Errors;

    public class EntityValidationExceptionFilterAttribute : ExceptionFilterBaseAttribute
    {
        private readonly IStringLocalizerFactory stringLocalizerFactory;
        private readonly IStringLocalizer domainModelLocalizer;
        private readonly IOptions<ApiOptions> apiOptions;

        public EntityValidationExceptionFilterAttribute(IStringLocalizerFactory stringLocalizerFactory, IOptions<ApiOptions> apiOptions = null, IProblemDetailsService problemDetailsService = null)
            : base(stringLocalizerFactory, problemDetailsService)
        {
            this.stringLocalizerFactory = stringLocalizerFactory;
            this.apiOptions = apiOptions;

            this.domainModelLocalizer = stringLocalizerFactory.Create(typeof(DomainModelResourceNames));
        }

        public override void OnException(ExceptionContext context)
        {
            if (context.Exception is EntityValidationException validationException)
            {
                var statusCode = this.apiOptions?.Value.ValidationErrorStatusCode ?? (int)HttpStatusCode.BadRequest;
                this.SetErrorResponse(context, this.GetErrorDto(validationException), (HttpStatusCode)statusCode);
            }
        }

        private ValidationErrorDto GetErrorDto(EntityValidationException exception)
        {
            var dto = new ValidationErrorDto
            {
                ErrorMessage = exception.GetLocalizedMessage(this.stringLocalizerFactory),
            };

            foreach (var validationResult in exception.ValidationResults)
            {
                dto.ValidationResults.Add(this.MapValidationResult(validationResult));
            }

            return dto;
        }

        protected override ProblemDetails GetProblemDetails(ExceptionContext context, ErrorDto dto, HttpStatusCode statusCode)
        {
            var problemDetails = base.GetProblemDetails(context, dto, statusCode);

            if (dto is ValidationErrorDto validationErrorDto)
            {
                problemDetails.SetValidationResults([.. validationErrorDto.ValidationResults]);
            }

            return problemDetails;
        }

        private EntityValidationResultDto MapValidationResult(EntityValidationResult validationResult)
        {
            var dto = new EntityValidationResultDto
            {
                EntityName = this.domainModelLocalizer[validationResult.GetEntityName()],
            };

            foreach (var validationError in validationResult.ValidationErrors)
            {
                dto.ValidationErrors.Add(this.MapValidationError(validationError));
            }

            return dto;
        }

        private EntityValidationErrorDto MapValidationError(EntityValidationError validationError)
        {
            return new EntityValidationErrorDto
            {
                ErrorMessage = validationError.ErrorMessage,
                PropertyName = !string.IsNullOrEmpty(validationError.PropertyName) ? this.domainModelLocalizer[validationError.PropertyName] : default(string),
            };
        }
    }
}
