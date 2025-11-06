namespace Nexplore.Practices.Web.Localization
{
    using System;

    // TODO: Find a way to configure "in memory" options within the project with a fluent api instead of "string magic" (not only for LocalizationOptions)
    // Something similar to:
    // services.ConfigurePractices(practicesOptions => {
    //      practicesOptions.ConfigureDatabase(databaseOptions=> { // ... });
    //      practicesOptions.ConfigureLocalization(localizationOptions=> { // ... });
    // });
    public class LocalizationOptions : Microsoft.Extensions.Localization.LocalizationOptions
    {
        public const string NAME = "Localization";

        public string[] ClientResourceTypes { get; init; } = Array.Empty<string>();

        public RewriteResourceTypeConfig[] RewriteResourceTypes { get; init; } = Array.Empty<RewriteResourceTypeConfig>();
    }
}
