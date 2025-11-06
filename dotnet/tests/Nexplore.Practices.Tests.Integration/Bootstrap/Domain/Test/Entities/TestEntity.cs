namespace Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities
{
    using System;
    using System.Collections.Generic;

    public class TestEntity : EntityBase
    {
        public string FirstName { get; set; }

        public string LastName { get; set; }

        public Guid? ParentId { get; set; }

        public virtual TestEntity Parent { get; set; }

        public virtual ICollection<TestEntity> Children { get; set; }
    }
}
