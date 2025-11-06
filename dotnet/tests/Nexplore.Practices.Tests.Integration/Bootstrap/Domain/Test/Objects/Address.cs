namespace Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Objects
{
    using System.ComponentModel.DataAnnotations;

    public class Address
    {
        public virtual Street Street { get; set; } = new();

        [StringLength(256)]
        public string City { get; set; }
    }
}
