namespace Nexplore.Practices.Web.Localization
{
    using System;
    using System.Collections.Generic;
    using System.Globalization;
    using Microsoft.Extensions.Localization;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core.Helpers;

    public class ClientLocalizationService : IClientLocalizationService
    {
        private readonly IStringLocalizerFactory stringLocalizerFactory;
        private readonly IOptions<LocalizationOptions> localizationOptions;

        public ClientLocalizationService(IStringLocalizerFactory stringLocalizerFactory, IOptions<LocalizationOptions> localizationOptions)
        {
            this.stringLocalizerFactory = stringLocalizerFactory;
            this.localizationOptions = localizationOptions;
        }

        public IReadOnlyDictionary<string, IReadOnlyDictionary<string, string>> GetLocalizationsForCulture(CultureInfo cultureInfo)
        {
            using (new CultureInfoSwitcher(cultureInfo))
            {
                var localizationsPerResource = new Dictionary<string, IReadOnlyDictionary<string, string>>();
                foreach (var clientResourceType in this.localizationOptions.Value.ClientResourceTypes)
                {
                    var localizations = new Dictionary<string, string>();

                    var resourceType = GetTypeFromStringPath(clientResourceType);
                    var stringLocalizer = this.stringLocalizerFactory.Create(resourceType);
                    foreach (var localizedString in stringLocalizer.GetAllStrings(true))
                    {
                        localizations.Add(localizedString.Name, localizedString.Value);
                    }

                    localizationsPerResource.Add(GetResourceNameFromType(resourceType), localizations);
                }

                return localizationsPerResource;
            }
        }

        private static Type GetTypeFromStringPath(string clientResourceType)
        {
            try
            {
                var resourceType = Type.GetType(clientResourceType);
                if (resourceType == null)
                {
                    throw new TypeLoadException();
                }

                return resourceType;
            }
            catch (Exception ex)
            {
                throw new ArgumentException(
                    $"The client resource type '{clientResourceType}' could not be loaded.",
                    ex);
            }
        }

        private static string GetResourceNameFromType(Type resourceType)
        {
            return resourceType.Name;
        }
    }
}
