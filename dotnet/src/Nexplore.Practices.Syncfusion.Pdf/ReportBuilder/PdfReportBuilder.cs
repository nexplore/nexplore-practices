namespace Nexplore.Practices.Syncfusion.Pdf.ReportBuilder
{
    using System;
    using System.IO;
    using global::Syncfusion.Drawing;
    using global::Syncfusion.Pdf;
    using global::Syncfusion.Pdf.Graphics;
    using Nexplore.Practices.Syncfusion.Pdf.ReportBuilder.Components;

    public sealed class PdfReportBuilder : IPdfReportBuilder, IDisposable
    {
        public PdfReportBuilder(PdfReportBuilderConfig config, PdfMargins margins = null, PdfPageOrientation orientation = PdfPageOrientation.Portrait)
        {
            this.Context = config;
            this.document = new PdfDocument();
            this.document.PageSettings.Margins = margins ?? new PdfMargins();
            this.document.PageSettings.Orientation = orientation;

            this.NewPage();
        }

        private readonly PdfDocument document;

        public float VerticalPointer { get; private set; }

        public PdfReportBuilderConfig Context { get; }

        public bool IsCurrentPageBlank => this.document.Pages[^1].IsBlank;

        public PdfReportBuilder CreateTextRow(Action<IPdfTextRowBuilder> b) =>
            this.ExecuteComponent<PdfTextRowBuilder, IPdfTextRowBuilder>(b);

        public PdfReportBuilder CreateImage(Action<IPdfImageBuilder> b) =>
            this.ExecuteComponent<PdfImageBuilder, IPdfImageBuilder>(b);

        public PdfReportBuilder CreateDivider(Action<IPdfDividerBuilder> b) =>
            this.ExecuteComponent<PdfDividerBuilder, IPdfDividerBuilder>(b);

        public PdfReportBuilder CreateGrid(Action<IPdfGridBuilder> b) =>
            this.ExecuteComponent<PdfGridBuilder, IPdfGridBuilder>(b);

        public PdfReportBuilder CreateTemplate(Action<IPdfTemplateBuilder> b) =>
            this.ExecuteComponent<PdfTemplateBuilder, IPdfTemplateBuilder>(b);

        public PdfReportBuilder AddText(string text, PdfFont font = null, bool asHtml = false) =>
            this.AddTextElement(text, asHtml, font ?? this.Context.TextFont, this.Context.TextBrush);

        public PdfReportBuilder AddHeader(string text, PdfFont font = null, bool asHtml = false) =>
            this.AddTextElement(text, asHtml, font ?? this.Context.HeaderFont, this.Context.HeaderBrush);

        public PdfReportBuilder AddTextBold(string text, PdfFont font = null, bool asHtml = false) =>
            this.AddTextElement(text, asHtml, font ?? this.Context.GetBoldFont(this.Context.TextFont.Size), this.Context.TextBrush);

        public PdfReportBuilder AddSpacer(float size)
        {
            if (this.VerticalPointer + size > this.document.Pages[^1].Graphics.ClientSize.Height)
            {
                this.NewPage();
            }
            else
            {
                // Only add spacer if we're not on a new page -- otherwise what's the point?
                this.VerticalPointer += size;
            }

            return this;
        }

        public void SetVerticalPointer(float pos)
        {
            this.VerticalPointer = pos;
        }

        public void NewPage()
        {
            this.document.Pages.Add();
            this.VerticalPointer = 0;
        }

        public SizeF GetPageBounds()
        {
            return this.document.Pages[^1].GetClientSize();
        }

        public SizeF GetPageSize()
        {
            return this.document.Pages[^1].Size;
        }

        public PdfPageSettings GetPageSettings()
        {
            return this.document.PageSettings;
        }

        public PdfDocument AsPdfDocument()
        {
            return this.document;
        }

        public Stream AsStream()
        {
            var stream = new MemoryStream();
            this.AsPdfDocument().Save(stream);
            stream.Position = 0; // Rewind
            return stream;
        }

        public void UseFooterWithPageNumbers(string leftFooterText = "", string pageNumberTemplate = "{0} / {1}", PdfBrush brush = null, PdfTrueTypeFont font = null, float topPadding = 0f)
        {
            font ??= this.Context.TextFont;
            brush ??= this.Context.TextBrush;

            var footerBounds = new RectangleF(0, 0, this.GetPageBounds().Width, font.Height + 1 + topPadding);
            var footer = new PdfPageTemplateElement(footerBounds);

            var pageNumberField = new PdfPageNumberField(font, brush);
            var pageCountField = new PdfPageCountField(font, brush);
            var pageCompositeField = new PdfCompositeField(font, brush, pageNumberTemplate, pageNumberField, pageCountField)
            {
                StringFormat = new PdfStringFormat(PdfTextAlignment.Right),
                Bounds = footer.Bounds,
            };

            footer.Graphics.DrawString(leftFooterText, font, brush, new PointF(0, topPadding), new PdfStringFormat(PdfTextAlignment.Left, PdfVerticalAlignment.Top));

            pageCompositeField.Draw(footer.Graphics, new PointF(0, topPadding));

            this.document.Template.Bottom = footer;
        }

        public PdfReportBuilder UsePageHeader(Action<PdfReportBuilder> headerBuilderAction)
        {
            this.document.Template.Top = this.CreatePageTemplate(headerBuilderAction);
            return this;
        }

        public PdfReportBuilder UsePageFooter(Action<PdfReportBuilder> footerBuilderAction)
        {
            this.document.Template.Bottom = this.CreatePageTemplate(footerBuilderAction);
            return this;
        }

        public PdfReportBuilder KeepTogether(Action<PdfReportBuilder> blockBuilderAction)
        {
            var blockBuilder = new PdfReportBuilder(this.Context, this.document.PageSettings.Margins, this.document.PageSettings.Orientation);
            blockBuilderAction.Invoke(blockBuilder);

            var nestedDocument = blockBuilder.AsPdfDocument();
            if (nestedDocument.PageCount > 1)
            {
                throw new InvalidOperationException("Cannot keep a block together which is larger than a single page");
            }

            _ = this.EnsureVerticalSpace(blockBuilder.VerticalPointer);

            var page = nestedDocument.Pages[0];
            var template = page.CreateTemplate();
            var drawLocation = new PointF(-this.document.PageSettings.Margins.Left, this.VerticalPointer - this.document.PageSettings.Margins.Top);

            this.document.Pages[^1].Graphics.DrawPdfTemplate(template, drawLocation);
            this.VerticalPointer += blockBuilder.VerticalPointer;

            return this;
        }

        public bool IsCurrentPage(PdfPage page) => page == this.document.Pages[^1];

        public void Dispose()
        {
            GC.SuppressFinalize(this);
            this.document.Dispose();
        }

        private bool EnsureVerticalSpace(float requiredHeight)
        {
            if (this.VerticalPointer + requiredHeight > this.GetPageBounds().Height)
            {
                this.NewPage();
                return true;
            }

            return false;
        }

        private PdfReportBuilder ExecuteComponent<T, TInterface>(Action<TInterface> b)
            where T : PdfComponentBuilderBase, TInterface
        {
            var component = Activator.CreateInstance(typeof(T), this) as T;
            b.Invoke(component);

            var componentAction = component!.BuildDrawAction();
            var layoutResult = componentAction.Action.Invoke(this.document.Pages[^1]);

            this.UpdateState(layoutResult);

            return this;
        }

        private void UpdateState(PdfLayoutResult layoutResult)
        {
            if (layoutResult is PdfTextLayoutResult textLayoutResult && textLayoutResult.LastLineBounds != default)
            {
                var height = (textLayoutResult.LastLineBounds.Y + textLayoutResult.LastLineBounds.Height) - textLayoutResult.Bounds.Y;
                this.VerticalPointer = textLayoutResult.Bounds.Y + height + this.Context.TextPadding;
            }
            else
            {
                this.VerticalPointer = layoutResult.Bounds.Y + layoutResult.Bounds.Height;
            }
        }

        private PdfReportBuilder AddTextElement(string text, bool asHtml, PdfFont font, PdfBrush brush)
        {
            var layoutFormat = new PdfLayoutFormat
            {
                Break = PdfLayoutBreakType.FitPage,
                Layout = PdfLayoutType.Paginate,
            };

            if (asHtml)
            {
                var htmlTextElement = new PdfHTMLTextElement(text, font, brush);
                var layoutResult = htmlTextElement.Draw(this.document.Pages[^1], new PointF(0, this.VerticalPointer), this.GetPageBounds().Width, layoutFormat);
                this.UpdateState(layoutResult);
            }
            else
            {
                var textElement = new PdfTextElement(text, font, brush);
                var textLayoutResult = textElement.Draw(this.document.Pages[^1], new PointF(0, this.VerticalPointer), this.GetPageBounds().Width, layoutFormat);
                this.UpdateState(textLayoutResult);
            }

            return this;
        }

        private PdfPageTemplateElement CreatePageTemplate(Action<PdfReportBuilder> templateBuilderAction)
        {
            var templateBuilder = new PdfReportBuilder(this.Context, this.document.PageSettings.Margins, this.document.PageSettings.Orientation);
            templateBuilderAction.Invoke(templateBuilder);

            var nestedDocument = templateBuilder.AsPdfDocument();
            if (nestedDocument.PageCount > 1)
            {
                throw new InvalidOperationException("Cannot add a header which is larger than a single page");
            }

            _ = this.EnsureVerticalSpace(templateBuilder.VerticalPointer);

            var page = nestedDocument.Pages[0];
            var template = page.CreateTemplate();
            var drawLocation = new PointF(-this.document.PageSettings.Margins.Left, this.VerticalPointer - this.document.PageSettings.Margins.Top);

            var templateElementBounds = new RectangleF(0, 0, this.GetPageBounds().Width, templateBuilder.VerticalPointer);
            var templateElement = new PdfPageTemplateElement(templateElementBounds);
            templateElement.Graphics.DrawPdfTemplate(template, drawLocation);

            return templateElement;
        }
    }
}
