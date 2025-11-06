namespace Nexplore.Practices.Web.Localization
{
    using System;
    using System.Linq;
    using Microsoft.Extensions.Localization;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core;

    internal class PracticesStringLocalizerFactory : IStringLocalizerFactory
    {
        private readonly IOptions<LocalizationOptions> options;
        private readonly ILogger<PracticesStringLocalizerFactory> logger;
        private readonly IStringLocalizerFactory innerFactory;

        public PracticesStringLocalizerFactory(
            IOptions<LocalizationOptions> options,
            ILogger<PracticesStringLocalizerFactory> logger,
            IStringLocalizerFactory innerFactory)
        {
            this.options = options;
            this.logger = logger;
            this.innerFactory = innerFactory;
        }

        public IStringLocalizer Create(Type resourceSource)
        {
            Guard.ArgumentNotNull(resourceSource, nameof(resourceSource));

            var rewriteConfig = this.GetRewriteConfigOrDefault(resourceSource.FullName);
            if (rewriteConfig != null)
            {
                this.logger.LogDebug($"Rewrite resource type from '{resourceSource.FullName}' to '{rewriteConfig}'");

                try
                {
                    return this.CreateFromRewriteConfig(rewriteConfig);
                }
                catch (Exception exception)
                {
                    this.logger.LogWarning(exception, $"Could not rewrite resource type from '{resourceSource.FullName}' to '{rewriteConfig}'");
                }
            }

            return this.CreateFromInnerFactory(resourceSource);
        }

        public IStringLocalizer Create(string baseName, string location)
        {
            Guard.ArgumentNotNull(baseName, nameof(baseName));
            Guard.ArgumentNotNull(location, nameof(location));

            // Location is ignored/not supported to evaluate resource rewrite
            var rewriteConfig = this.GetRewriteConfigOrDefault(baseName);
            if (rewriteConfig != null)
            {
                this.logger.LogDebug($"Rewrite resource type from '{baseName}' to '{rewriteConfig}'");

                try
                {
                    return this.CreateFromRewriteConfig(rewriteConfig);
                }
                catch (Exception exception)
                {
                    this.logger.LogWarning(exception, $"Could not rewrite resource type from '{baseName}' to '{rewriteConfig}'");
                }
            }

            // No rewrite and therefor also no fallback
            return this.CreateFromInnerFactory(baseName, location);
        }

        private RewriteResourceTypeConfig GetRewriteConfigOrDefault(string sourceType)
        {
            var configs = this.options.Value.RewriteResourceTypes?.Where(c => c.RewriteFrom == sourceType).ToArray();
            if (configs?.Length > 1)
            {
                throw new InvalidOperationException($"More than one rewrite type configured for '{sourceType}'");
            }

            return configs?.FirstOrDefault();
        }

        private IStringLocalizer CreateFromRewriteConfig(RewriteResourceTypeConfig rewriteConfig)
        {
            Guard.ArgumentNotNull(rewriteConfig.RewriteTo, nameof(rewriteConfig.RewriteTo));

            var sourceType = rewriteConfig.RewriteToAsType();
            var fallbackType = rewriteConfig.FallbackToAsType();

            return this.CreateFromInnerFactory(sourceType, fallbackType);
        }

        private IStringLocalizer CreateFromInnerFactory(Type source, Type fallback = null)
        {
            var sourceLocalizer = new StringLocalizerWithFormat(this.innerFactory.Create(source));
            if (fallback == null)
            {
                return sourceLocalizer;
            }

            var fallbackLocalizer = new StringLocalizerWithFormat(this.innerFactory.Create(fallback));
            return new StringLocalizerWithFallback(sourceLocalizer, fallbackLocalizer);
        }

        private StringLocalizerWithFormat CreateFromInnerFactory(string baseName, string location)
        {
            return new StringLocalizerWithFormat(this.innerFactory.Create(baseName, location));
        }
    }
}
