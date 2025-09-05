namespace Nexplore.Practices.Web.Dtos.Errors
{
    using System.Collections.Generic;
    using System.Collections.ObjectModel;

    public class EntityValidationResultDto
    {
        public string EntityName { get; set; }

        public ICollection<EntityValidationErrorDto> ValidationErrors { get; } = new Collection<EntityValidationErrorDto>();
    }
}
