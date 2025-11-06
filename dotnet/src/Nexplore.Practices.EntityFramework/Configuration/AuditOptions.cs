namespace Nexplore.Practices.EntityFramework.Configuration
{
    using System;
    using Nexplore.Practices.Core.Domain.Model;

    public class AuditOptions
    {
        public const string NAME = "Audit";

        public bool Enabled { get; set; }

        public string[] ExcludedProperties { get; set; } = { nameof(IEntity<object>.Id), nameof(IModificationMetadata.ModifiedBy), nameof(IModificationMetadata.ModifiedOn), nameof(IModificationMetadata.ModifiedWith), nameof(ITimestamped.Timestamp) };

        public string[] ExcludedTypes { get; set; } = Array.Empty<string>();
    }
}
