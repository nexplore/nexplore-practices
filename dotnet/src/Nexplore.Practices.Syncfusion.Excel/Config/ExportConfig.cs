namespace Nexplore.Practices.Syncfusion.Excel.Config
{
    using Nexplore.Practices.Syncfusion.Excel.ColumnMapping;

    public class ExportConfig<TEntity> : IExportConfig<TEntity>
        where TEntity : class
    {
        public IColumnValueConverters<TEntity> ValueConverters { get; init; } = new ColumnValueConverters<TEntity>();

        public IColumnTypeConverters TypeConverters { get; init; } = new ColumnTypeConverters();

        public IColumnExclusions<TEntity> Exclusions { get; init; } = new ColumnExclusions<TEntity>();

        public IColumnTranslations<TEntity> Translations { get; init; } = new ColumnTranslations<TEntity>();
    }
}
