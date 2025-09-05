namespace Nexplore.Practices.Syncfusion.Excel.ColumnMapping
{
    using System;
    using System.Linq.Expressions;

    public interface IColumnValueConverters<TEntity>
        where TEntity : class
    {
        void AddOrUpdate<TProp, TResult>(Expression<Func<TEntity, TProp>> propertySelector, Func<TProp, TResult> converterFunc);

        void AddOrUpdate<TProp, TResult>(Expression<Func<TEntity, TProp>> propertySelector, Func<TEntity, TProp, TResult> converterFunc);

        object ConvertOrDefault(TEntity entity, string propertyName, object propertyValue);

        bool HasConverterFor(string propertyName);
    }
}
