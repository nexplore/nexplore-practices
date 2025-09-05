namespace Nexplore.Practices.Syncfusion.Pdf.ReportBuilder
{
    using global::Syncfusion.Drawing;
    using global::Syncfusion.Pdf;

    internal interface IPdfReportBuilder
    {
        PdfReportBuilderConfig Context { get; }

        float VerticalPointer { get; }

        SizeF GetPageBounds();

        SizeF GetPageSize();

        bool IsCurrentPage(PdfPage page);
    }
}
