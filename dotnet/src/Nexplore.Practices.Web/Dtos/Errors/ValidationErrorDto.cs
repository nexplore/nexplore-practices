namespace Nexplore.Practices.Web.Dtos.Errors
{
    using System.Collections.Generic;

    public class ValidationErrorDto : ErrorDto
    {
        public ICollection<EntityValidationResultDto> ValidationResults { get; } = new List<EntityValidationResultDto>();
    }
}
