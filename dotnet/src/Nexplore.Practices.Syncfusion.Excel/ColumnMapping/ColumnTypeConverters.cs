namespace Nexplore.Practices.Syncfusion.Excel.ColumnMapping
{
    using System;
    using System.Collections.Generic;

    internal sealed class ColumnTypeConverters : IColumnTypeConverters
    {
        private readonly Dictionary<Type, IConverter> converters = new();

        public void AddOrUpdate<TIn, TOut>(Func<TIn, TOut> converterFunc)
        {
            this.converters[typeof(TIn)] = new Converter<TIn, TOut>(converterFunc);
        }

        public object ConvertOrDefault(Type propertyRuntimeType, object propertyValue)
        {
            return this.converters.TryGetValue(propertyRuntimeType, out var converter)
                ? converter.Execute(propertyValue)
                : propertyValue;
        }
    }
}