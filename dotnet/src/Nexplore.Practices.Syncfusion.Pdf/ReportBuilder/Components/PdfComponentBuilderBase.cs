namespace Nexplore.Practices.Syncfusion.Pdf.ReportBuilder.Components
{
    using System;
    using global::Syncfusion.Pdf;
    using global::Syncfusion.Pdf.Graphics;

    internal abstract class PdfComponentBuilderBase
    {
        protected PdfComponentBuilderBase(IPdfReportBuilder builder)
        {
            this.builder = builder;
        }

        protected readonly IPdfReportBuilder builder;

        public abstract PdfComponentBuilderDrawAction BuildDrawAction();

        internal struct PdfComponentBuilderDrawAction
        {
            public Func<PdfPage, PdfLayoutResult> Action { get; init; }

            public PdfComponentBuilderDrawAction(Func<PdfPage, PdfLayoutResult> action)
            {
                this.Action = action;
            }
        }
    }
}
