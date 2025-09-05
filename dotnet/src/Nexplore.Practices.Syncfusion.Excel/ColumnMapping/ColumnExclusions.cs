namespace Nexplore.Practices.Syncfusion.Excel.ColumnMapping
{
    using System;
    using System.Collections.Generic;
    using System.Linq.Expressions;

    internal sealed class ColumnExclusions<TEntity> : IColumnExclusions<TEntity>
        where TEntity : class
    {
        private readonly HashSet<string> exclusions = new();

        public void AddOrUpdate<TProp>(Expression<Func<TEntity, TProp>> propertySelector)
        {
            var propertyName = propertySelector.GetPropertyName();
            this.exclusions.Add(propertyName);
        }

        public bool IsExcluded(string propertyName)
        {
            return this.exclusions.Contains(propertyName);
        }
    }
}