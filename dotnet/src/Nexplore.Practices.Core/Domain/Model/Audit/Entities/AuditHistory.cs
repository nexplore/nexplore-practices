namespace Nexplore.Practices.Core.Domain.Model.Audit.Entities
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public class AuditHistory
    {
        [Required]
        public long Id { get; set; }

        [Required, StringLength(256)]
        public string CreatedBy { get; set; }

        [Required]
        public DateTimeOffset CreatedOn { get; set; }

        [Required, StringLength(32)]
        public string CreatedWith { get; set; }

        [Required, StringLength(32)]
        public string ModificationType { get; set; }

        [Required, StringLength(256)]
        public string EntityType { get; set; }

        [Required, StringLength(256)]
        public string EntityId { get; set; }

        [Required, StringLength(256)]
        public string PropertyName { get; set; }

        [Required, StringLength(256)]
        public string PropertyType { get; set; }

        public string OldValue { get; set; }

        public string NewValue { get; set; }
    }
}
