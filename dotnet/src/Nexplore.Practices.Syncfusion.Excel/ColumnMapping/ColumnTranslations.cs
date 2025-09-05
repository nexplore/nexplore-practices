namespace Nexplore.Practices.Syncfusion.Excel.ColumnMapping
{
    using System;
    using System.Collections.Generic;
    using System.Linq.Expressions;

    internal sealed class ColumnTranslations<TEntity> : IColumnTranslations<TEntity>
        where TEntity : class
    {
        private readonly Dictionary<string, string> translations = new();

        public void AddOrUpdate<TProp>(Expression<Func<TEntity, TProp>> propertySelector, string translation)
        {
            var propertyName = propertySelector.GetPropertyName();
            this.translations[propertyName] = translation;
        }

        public string GetOrDefault(string propertyName)
        {
            this.translations.TryGetValue(propertyName, out var result);
            return result ?? propertyName;
        }

        public bool HasTranslationFor(string propertyName)
        {
            return this.translations.ContainsKey(propertyName);
        }
    }
}