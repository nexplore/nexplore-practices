namespace Nexplore.Practices.Syncfusion.Excel.Config
{
    public interface IExportConfigFactory
    {
        IExportConfig<TEntity> CreateConfig<TEntity>()
            where TEntity : class;
    }
}
