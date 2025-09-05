namespace Nexplore.Practices.Web.Localization
{
    using System.Collections.Generic;
    using System.Linq;
    using Microsoft.Extensions.Localization;

    internal class StringLocalizerWithFallback : IStringLocalizer
    {
        private readonly IStringLocalizer sourceStringLocalizer;
        private readonly IStringLocalizer fallbackStringLocalizer;

        public StringLocalizerWithFallback(IStringLocalizer sourceStringLocalizer, IStringLocalizer fallbackStringLocalizer)
        {
            this.sourceStringLocalizer = sourceStringLocalizer;
            this.fallbackStringLocalizer = fallbackStringLocalizer;
        }

        public LocalizedString this[string name]
        {
            get
            {
                var value = this.sourceStringLocalizer[name];
                return value.ResourceNotFound ? this.fallbackStringLocalizer[name] : value;
            }
        }

        public LocalizedString this[string name, params object[] arguments]
        {
            get
            {
                var value = this.sourceStringLocalizer[name, arguments];
                return value.ResourceNotFound ? this.fallbackStringLocalizer[name, arguments] : value;
            }
        }

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures)
        {
            var fromSource = this.sourceStringLocalizer.GetAllStrings(includeParentCultures);
            var fromFallback = this.fallbackStringLocalizer.GetAllStrings(includeParentCultures);

            return fromSource.Concat(fromFallback);
        }
    }

    internal class StringLocalizerWithFallback<TSource, TFallback> : StringLocalizerWithFallback, IStringLocalizer<TSource, TFallback>
    {
        public StringLocalizerWithFallback(IStringLocalizerFactory factory)
            : base(factory.Create(typeof(TSource)), factory.Create(typeof(TFallback)))
        {
        }
    }
}
