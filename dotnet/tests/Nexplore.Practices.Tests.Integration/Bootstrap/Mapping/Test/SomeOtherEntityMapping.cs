namespace Nexplore.Practices.Tests.Integration.Bootstrap.Mapping.Test
{
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities;

    internal sealed class SomeOtherEntityMapping : MappingBase<SomeOtherEntity>
    {
        protected override void Map(EntityTypeBuilder<SomeOtherEntity> builder)
        {
        }
    }
}
