namespace Nexplore.Practices.Syncfusion.Excel.ColumnMapping
{
    using System;

    public interface IColumnTypeConverters
    {
        void AddOrUpdate<TIn, TOut>(Func<TIn, TOut> converterFunc);

        object ConvertOrDefault(Type propertyRuntimeType, object propertyValue);
    }
}
