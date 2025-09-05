namespace Nexplore.Practices.EntityFramework.Mapping
{
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    using Nexplore.Practices.Core.Domain.Model.Audit.Entities;

    public class AuditHistoryMapping : IEntityTypeConfiguration<AuditHistory>
    {
        public void Configure(EntityTypeBuilder<AuditHistory> builder)
        {
            builder.HasKey(x => x.Id);

            builder.ToTable("AuditHistory", "audit");
        }
    }
}
