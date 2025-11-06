namespace Nexplore.Practices.Syncfusion.Pdf.Reports
{
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;

    public interface IReportRenderer<in TReportData>
    {
        Task<byte[]> RenderAsync(TReportData reportData, CancellationToken cancellationToken = default);

        Task<Stream> RenderToStreamAsync(TReportData reportData, CancellationToken cancellationToken = default);

        Task RenderToStreamAsync(TReportData reportData, Stream outputStream, CancellationToken cancellationToken = default);
    }
}
