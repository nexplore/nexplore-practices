namespace Nexplore.Practices.Syncfusion.Pdf.ReportBuilder.Components
{
    using System;
    using System.Diagnostics.CodeAnalysis;
    using global::Syncfusion.Drawing;
    using global::Syncfusion.Pdf.Graphics;

    public interface IPdfDividerBuilder
    {
        IPdfDividerBuilder From(float from);

        [SuppressMessage("Naming", "CA1716:Identifiers should not match keywords")]
        IPdfDividerBuilder To(float to);

        IPdfDividerBuilder WithPadding(float pre = 0f, float post = 0f);
    }

    internal sealed class PdfDividerBuilder : PdfComponentBuilderBase, IPdfDividerBuilder
    {
        private float from;
        private float to;
        private float pre;
        private float post;

        public PdfDividerBuilder(IPdfReportBuilder builder)
            : base(builder)
        {
            this.from = 0f;
            this.to = this.builder.GetPageBounds().Width;
        }

        public IPdfDividerBuilder From(float from)
        {
            this.from = from;
            return this;
        }

        public IPdfDividerBuilder To(float to)
        {
            this.to = to;
            return this;
        }

        public IPdfDividerBuilder WithPadding(float pre = 0f, float post = 0f)
        {
            this.pre = pre;
            this.post = post;
            return this;
        }

        public override PdfComponentBuilderDrawAction BuildDrawAction()
        {
            if (this.from < 0f || this.to > this.builder.GetPageBounds().Width)
            {
                throw new ArgumentException(
                    $"From / To constraints must be >= 0 and <= Page width ({this.builder.GetPageBounds().Width}). From was {this.from} and to was {this.to}");
            }

            return new PdfComponentBuilderDrawAction(page =>
            {
                var pdfLine = new PdfLine(this.builder.Context.DividerPen, this.from, 0f, this.to, 0f);

                var layoutResult = pdfLine.Draw(page, new PointF(0f, this.builder.VerticalPointer + this.pre));
                var paddedSize = new SizeF(layoutResult.Bounds.Width, this.post);
                return new PdfLayoutResult(layoutResult.Page, new RectangleF(layoutResult.Bounds.Location, paddedSize));
            });
        }
    }
}
