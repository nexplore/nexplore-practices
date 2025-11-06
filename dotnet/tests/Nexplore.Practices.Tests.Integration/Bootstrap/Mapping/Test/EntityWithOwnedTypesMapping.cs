namespace Nexplore.Practices.Tests.Integration.Bootstrap.Mapping.Test
{
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities;

    internal sealed class EntityWithOwnedTypesMapping : MappingBase<EntityWithOwnedTypes>
    {
        protected override void Map(EntityTypeBuilder<EntityWithOwnedTypes> builder)
        {
            builder.OwnsOne(e => e.Address, b =>
            {
                b.OwnsOne(et => et.Street);
                b.Navigation(et => et.Street).IsRequired();
            });
            builder.Navigation(e => e.Address).IsRequired();
        }
    }
}
