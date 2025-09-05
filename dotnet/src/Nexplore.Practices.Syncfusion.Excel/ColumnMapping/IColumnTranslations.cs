namespace Nexplore.Practices.Syncfusion.Excel.ColumnMapping
{
    using System;
    using System.Linq.Expressions;

    public interface IColumnTranslations<TEntity>
        where TEntity : class
    {
        void AddOrUpdate<TProp>(Expression<Func<TEntity, TProp>> propertySelector, string translation);

        string GetOrDefault(string propertyName);

        bool HasTranslationFor(string propertyName);
    }
}
