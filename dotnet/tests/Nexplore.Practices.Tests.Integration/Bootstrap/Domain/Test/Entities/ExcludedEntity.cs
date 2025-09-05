namespace Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities
{
    using System.ComponentModel.DataAnnotations;

    public class ExcludedEntity : EntityBase
    {
        [StringLength(256)]
        public string Name { get; set; }
    }
}
