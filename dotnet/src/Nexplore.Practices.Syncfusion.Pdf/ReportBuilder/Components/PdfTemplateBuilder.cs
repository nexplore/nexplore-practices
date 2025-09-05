namespace Nexplore.Practices.Syncfusion.Pdf.ReportBuilder.Components
{
    using global::Syncfusion.Drawing;
    using global::Syncfusion.Pdf.Graphics;

    public interface IPdfTemplateBuilder
    {
        IPdfTemplateBuilderMutations WithTemplate(PdfTemplate pdfTemplate);
    }

    public interface IPdfTemplateBuilderMutations
    {
        IPdfTemplateBuilderMutations AtIndent(float indent);

        IPdfTemplateBuilderMutations RestrictHeight(int height);
    }

    internal sealed class PdfTemplateBuilder : PdfComponentBuilderBase, IPdfTemplateBuilder, IPdfTemplateBuilderMutations
    {
        private PdfTemplate template;

        private float tab;

        private SizeF drawSize;

        public PdfTemplateBuilder(IPdfReportBuilder builder)
            : base(builder)
        {
        }

        public IPdfTemplateBuilderMutations WithTemplate(PdfTemplate template)
        {
            this.template = template;
            this.drawSize = this.template.Size;
            return this;
        }

        public IPdfTemplateBuilderMutations AtIndent(float indent)
        {
            this.tab = indent;
            return this;
        }

        public IPdfTemplateBuilderMutations RestrictHeight(int height)
        {
            if (this.template.Height <= height)
            {
                return this;
            }

            var quotient = this.template.Height / height;

            this.drawSize = new SizeF
            {
                Height = height,
                Width = this.template.Width / quotient,
            };

            return this;
        }

        public override PdfComponentBuilderDrawAction BuildDrawAction()
        {
            return new PdfComponentBuilderDrawAction(page =>
            {
                var layout = new RectangleF
                {
                    Location = new PointF(this.tab, this.builder.VerticalPointer),
                    Size = this.drawSize,
                };
                page.Graphics.DrawPdfTemplate(this.template, layout.Location, layout.Size);
                return new PdfLayoutResult(page, layout);
            });
        }
    }
}
