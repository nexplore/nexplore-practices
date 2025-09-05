namespace Nexplore.Practices.Configuration
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using Microsoft.Extensions.Configuration;
    using Nexplore.Practices.Core;

    public static class ConfigurationFactory
    {
        public static IConfiguration Create(Func<IEnumerable<KeyValuePair<string, string>>> memoryConfigAction = null, string basePath = null)
        {
            var environmentName = GetCurrentEnvironmentName();
            var builder = new ConfigurationBuilder()
                .SetBasePath(basePath ?? Path.Combine(AppContext.BaseDirectory))
                .AddJsonFile(PracticesConstants.Configuration.APPSETTINGS_NAME, optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{environmentName}.json", optional: true, reloadOnChange: true)
                .AddJsonFile(PracticesConstants.Configuration.APPSETTINGS_OVERRIDE_NAME, optional: true, reloadOnChange: true);

            if (memoryConfigAction != null)
            {
                builder = builder.AddInMemoryCollection(memoryConfigAction());
            }

            return builder.Build();
        }

        private static string GetCurrentEnvironmentName()
        {
            // Precedence and default like described here: https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments?view=aspnetcore-7.0
            // Precedence in the framework depends on the concrete host builder. Decided to use the most used precedence over all builders.
            var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            if (string.IsNullOrWhiteSpace(environmentName))
            {
                environmentName = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT");
            }

            if (string.IsNullOrWhiteSpace(environmentName))
            {
                environmentName = "Production";
            }

            return environmentName;
        }
    }
}
