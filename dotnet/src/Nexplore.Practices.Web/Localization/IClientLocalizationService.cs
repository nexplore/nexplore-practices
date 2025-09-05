namespace Nexplore.Practices.Web.Localization
{
    using System.Collections.Generic;
    using System.Globalization;

    public interface IClientLocalizationService
    {
        IReadOnlyDictionary<string, IReadOnlyDictionary<string, string>> GetLocalizationsForCulture(CultureInfo cultureInfo);
    }
}
