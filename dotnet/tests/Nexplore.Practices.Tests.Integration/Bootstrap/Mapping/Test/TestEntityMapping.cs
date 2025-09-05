namespace Nexplore.Practices.Tests.Integration.Bootstrap.Mapping.Test
{
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test.Entities;

    internal sealed class TestEntityMapping : MappingBase<TestEntity>
    {
        protected override void Map(EntityTypeBuilder<TestEntity> builder)
        {
            builder.HasMany(e => e.Children).WithOne(e => e.Parent).HasForeignKey(e => e.ParentId).OnDelete(DeleteBehavior.NoAction);
        }
    }
}
