namespace Nexplore.Practices.Web.Controllers
{
    using System.Collections.Generic;
    using System.Globalization;
    using Microsoft.AspNetCore.Mvc;
    using Nexplore.Practices.Web.Localization;

    public class LocalizationController : Controller
    {
        private readonly IClientLocalizationService clientLocalizationService;

        public LocalizationController(IClientLocalizationService clientLocalizationService)
        {
            this.clientLocalizationService = clientLocalizationService;
        }

        public IReadOnlyDictionary<string, IReadOnlyDictionary<string, string>> GetLocalizations(string cultureName)
        {
            var requestedCultureInfo = CultureInfo.GetCultureInfo(cultureName);
            return this.clientLocalizationService.GetLocalizationsForCulture(requestedCultureInfo);
        }
    }
}
