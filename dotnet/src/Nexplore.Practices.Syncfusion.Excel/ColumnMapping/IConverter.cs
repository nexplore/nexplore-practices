namespace Nexplore.Practices.Syncfusion.Excel.ColumnMapping
{
    internal interface IConverter
    {
        object Execute(object value);
    }

    internal interface IConverter<in TContext>
    {
        object Execute(TContext context, object value);
    }
}
