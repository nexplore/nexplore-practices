namespace Nexplore.Practices.Syncfusion.Excel.ColumnMapping
{
    using System;
    using System.Linq.Expressions;

    public interface IColumnExclusions<TEntity>
        where TEntity : class
    {
        void AddOrUpdate<TProp>(Expression<Func<TEntity, TProp>> propertySelector);

        bool IsExcluded(string propertyName);
    }
}
