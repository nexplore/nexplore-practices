namespace Nexplore.Practices.EntityFramework.Domain
{
    using System;

    public class GeneratorsHistoryRow
    {
        public string MigrationId { get; set; }

        public string ProductVersion { get; set; }

        public DateTimeOffset? GeneratorsApplied { get; set; }
    }
}
