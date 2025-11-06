namespace Nexplore.Practices.Syncfusion.Excel.Config
{
    using Nexplore.Practices.Syncfusion.Excel.ColumnMapping;

    public interface IExportConfig<TEntity>
        where TEntity : class
    {
        IColumnValueConverters<TEntity> ValueConverters { get; }

        IColumnTypeConverters TypeConverters { get; }

        IColumnExclusions<TEntity> Exclusions { get; }

        IColumnTranslations<TEntity> Translations { get; }
    }
}
