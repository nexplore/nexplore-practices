namespace Nexplore.Practices.Syncfusion.Excel.Config
{
    public sealed class DefaultExportConfigFactory : IExportConfigFactory
    {
        // Override this in your Implementation and add your default converters here!
        public IExportConfig<TEntity> CreateConfig<TEntity>()
            where TEntity : class
        {
            var config = new ExportConfig<TEntity>();

            /*
            Example Default Converters:
            //One for all booleans:
            config.TypeConverters.AddOrUpdate((bool b) => b ? "Yes" : "No");
            //One for all nullable booleans:
            config.TypeConverters.AddOrUpdate((bool? b) => b.HasValue ? b.Value ? "Yes" : "No" : null);
            */

            return config;
        }
    }
}