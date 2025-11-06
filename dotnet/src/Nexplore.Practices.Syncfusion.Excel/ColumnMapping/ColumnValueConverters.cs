namespace Nexplore.Practices.Syncfusion.Excel.ColumnMapping
{
    using System;
    using System.Collections.Generic;
    using System.Linq.Expressions;

    internal sealed class ColumnValueConverters<TEntity> : IColumnValueConverters<TEntity>
        where TEntity : class
    {
        private readonly Dictionary<string, IConverter<TEntity>> converters = new();

        public void AddOrUpdate<TProp, TResult>(Expression<Func<TEntity, TProp>> propertySelector, Func<TProp, TResult> converterFunc)
        {
            this.AddOrUpdate(propertySelector, (_, arg) => converterFunc(arg));
        }

        public void AddOrUpdate<TProp, TResult>(Expression<Func<TEntity, TProp>> propertySelector, Func<TEntity, TProp, TResult> converterFunc)
        {
            var propertyConverter = new Converter<TEntity, TProp, TResult>(converterFunc);
            var propertyName = propertySelector.GetPropertyName();
            this.converters[propertyName] = propertyConverter;
        }

        public object ConvertOrDefault(TEntity entity, string propertyName, object propertyValue)
        {
            return this.converters.TryGetValue(propertyName, out var converter)
                ? converter.Execute(entity, propertyValue)
                : propertyValue;
        }

        public bool HasConverterFor(string propertyName)
        {
            return this.converters.ContainsKey(propertyName);
        }
    }
}