namespace Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Objects
{
    using System.ComponentModel.DataAnnotations;

    public class Street
    {
        [StringLength(32)]
        public string Number { get; set; }

        [StringLength(256)]
        public string Name { get; set; }
    }
}
