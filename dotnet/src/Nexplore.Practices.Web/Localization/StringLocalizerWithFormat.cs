namespace Nexplore.Practices.Web.Localization
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text.RegularExpressions;
    using Microsoft.Extensions.Localization;

    internal partial class StringLocalizerWithFormat : IStringLocalizer
    {
        private readonly IStringLocalizer innerStringLocalizer;

        public StringLocalizerWithFormat(IStringLocalizer innerStringLocalizer)
        {
            this.innerStringLocalizer = innerStringLocalizer;
        }

        public LocalizedString this[string name]
        {
            get
            {
                // No format possible, so just return from inner string localizer
                return this.innerStringLocalizer[name];
            }
        }

        /// <summary>
        /// <list type="bullet">
        /// <item>Invokes the base indexer to resolve composite formats handled by <c>string.Format()</c> e.g. <c>"Foo {0}"</c>.</item>
        /// <item>Interpolates template strings such as <c>"Foo {{ bar }}"</c>, if the provided params (<c>arguments</c>) contains a <c>KeyValuePair&lt;string, string&gt;</c>. with <c>("foo", "replacement")</c> respectively.</item>
        /// </list>
        /// Can handle mixed composite and template strings such as <c>"Foo {0} {{ bar }} {1}</c>, where the indices correlate exactly with the order in <c>arguments</c> e.g. <c>{ "Value0", ("bar", "ValueBar"), "Value1" }</c>.
        /// </summary>
        /// <param name="name">Name of the resource.</param>
        /// <param name="arguments">Template arguments.</param>
        public LocalizedString this[string name, params object[] arguments]
        {
            get
            {
                var baseLocalizedString = this.innerStringLocalizer[name, arguments];
                var baseLocalizedStringValue = baseLocalizedString.Value;

                var replacements = arguments.OfType<(string, string)>().ToLookup(k => k.Item1, v => v.Item2);

                if (replacements.Count != 0)
                {
                    baseLocalizedStringValue = ApplyTemplates(replacements, baseLocalizedStringValue);
                }

                return new LocalizedString(name, baseLocalizedStringValue, baseLocalizedString.ResourceNotFound, baseLocalizedString.SearchedLocation);
            }
        }

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures)
        {
            return this.innerStringLocalizer.GetAllStrings(includeParentCultures);
        }

        [GeneratedRegex(@"{\s*(\w+)\s*}", RegexOptions.Multiline)]
        private static partial Regex TemplateRegex();

        private static string ApplyTemplates(ILookup<string, string> replacements, string value)
        {
            // Single braces, since string.Format() considers '{' and '}' as escape characters. So, templates like "{{ key }}" will arrive here surrounded by only one set of curlies.
            var templateRegex = TemplateRegex();
            return templateRegex.Replace(
                value,
                match =>
                {
                    var templateKey = match.Groups[1].Value;
                    if (replacements.Contains(templateKey))
                    {
                        return replacements[templateKey].First();
                    }

                    throw new FormatException(
                        $"Could not resolve the template '{{ {templateKey} }}' because the key was not present in the {nameof(replacements)}");
                });
        }
    }
}
