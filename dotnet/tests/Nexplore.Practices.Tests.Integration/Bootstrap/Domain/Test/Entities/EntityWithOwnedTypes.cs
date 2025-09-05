namespace Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities
{
    using System.ComponentModel.DataAnnotations;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Objects;

    public class EntityWithOwnedTypes : EntityBase
    {
        [StringLength(256)]
        public string Name { get; set; }

        [StringLength(256)]
        public string ExcludedProperty { get; set; }

        public virtual Address Address { get; set; } = new();
    }
}
