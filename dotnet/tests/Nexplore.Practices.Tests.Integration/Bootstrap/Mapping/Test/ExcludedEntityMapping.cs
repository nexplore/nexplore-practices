namespace Nexplore.Practices.Tests.Integration.Bootstrap.Mapping.Test
{
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities;

    internal sealed class ExcludedEntityMapping : MappingBase<ExcludedEntity>
    {
        protected override void Map(EntityTypeBuilder<ExcludedEntity> builder)
        {
        }
    }
}
