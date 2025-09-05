namespace Nexplore.Practices.Tests.Integration.Bootstrap.Mapping
{
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain;

    internal abstract class MappingBase<TEntity> : IEntityTypeConfiguration<TEntity>
        where TEntity : EntityBase
    {
        public void Configure(EntityTypeBuilder<TEntity> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.Timestamp)
                .HasColumnType("timestamp")
                .IsRequired()
                .IsRowVersion();

            this.Map(builder);
        }

        protected abstract void Map(EntityTypeBuilder<TEntity> builder);
    }
}
