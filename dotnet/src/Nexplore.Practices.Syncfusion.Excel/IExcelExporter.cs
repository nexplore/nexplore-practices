namespace Nexplore.Practices.Syncfusion.Excel
{
    using System.Collections.Generic;
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Extensions.Localization;
    using Nexplore.Practices.Syncfusion.Excel.Config;

    public interface IExcelExporter
    {
        Task<Stream> ExportAsync<TEntity>(IEnumerable<TEntity> entities, IExportConfig<TEntity> exportConfig, IStringLocalizer localizer, CancellationToken cancellationToken = default)
            where TEntity : class;

        Task ExportToStreamAsync<TEntity>(IEnumerable<TEntity> entities, IExportConfig<TEntity> config, Stream outputStream, IStringLocalizer localizer, CancellationToken cancellationToken = default)
            where TEntity : class;

        Task<Stream> ExportAsync<TEntity>(IAsyncEnumerable<TEntity> entities, IExportConfig<TEntity> exportConfig, IStringLocalizer localizer, CancellationToken cancellationToken = default)
            where TEntity : class;

        Task ExportToStreamAsync<TEntity>(IAsyncEnumerable<TEntity> entities, IExportConfig<TEntity> config, Stream outputStream, IStringLocalizer localizer, CancellationToken cancellationToken = default)
            where TEntity : class;
    }
}