namespace Nexplore.Practices.Syncfusion.Pdf.Reports
{
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;
    using global::Syncfusion.Pdf;
    using Nexplore.Practices.Syncfusion.Pdf.ReportBuilder;

    public abstract class ReportRendererBase<T> : IReportRenderer<T>
    {
        protected abstract PdfDocument BuildReport(T reportData, PdfReportBuilderConfig configuration);

        protected abstract PdfReportBuilderConfig GetConfiguration();

        public Task<byte[]> RenderAsync(T reportData, CancellationToken cancellationToken)
        {
            using var stream = new MemoryStream();
            this.RenderReportToStream(reportData, stream);
            return Task.FromResult(stream.ToArray());
        }

        public Task<Stream> RenderToStreamAsync(T reportData, CancellationToken cancellationToken)
        {
            Stream stream = new MemoryStream();
            this.RenderReportToStream(reportData, stream);
            return Task.FromResult(stream);
        }

        public Task RenderToStreamAsync(T reportData, Stream outputStream, CancellationToken cancellationToken)
        {
            this.RenderReportToStream(reportData, outputStream);
            return Task.CompletedTask;
        }

        private void RenderReportToStream(T reportData, Stream outputStream)
        {
            using (var configuration = this.GetConfiguration())
            {
                using var report = this.BuildReport(reportData, configuration);
                report.Save(outputStream);
            }
        }
    }
}
