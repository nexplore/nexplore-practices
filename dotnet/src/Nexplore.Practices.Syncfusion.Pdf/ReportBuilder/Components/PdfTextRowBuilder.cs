namespace Nexplore.Practices.Syncfusion.Pdf.ReportBuilder.Components
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using global::Syncfusion.Drawing;
    using global::Syncfusion.Pdf.Graphics;

    public interface IPdfTextRowBuilder
    {
        IPdfTextRowBuilder WithIndent(float additionalIndent);

        IPdfTextRowBuilder AtIndent(float indent);

        IPdfTextRowBuilder AddText(string text, PdfStringFormat stringFormat);

        IPdfTextRowBuilder AddText(string text);

        IPdfTextRowBuilder AddTextHtml(string text);

        IPdfTextRowBuilder AddHeader(string text, PdfStringFormat stringFormat = null);

        IPdfTextRowBuilder AddHeader(string text);

        IPdfTextRowBuilder AddHeaderHtml(string text);

        IPdfTextRowBuilder AddTextBold(string text);
    }

    internal sealed class PdfTextRowBuilder : PdfComponentBuilderBase, IPdfTextRowBuilder
    {
        private readonly List<TextItem> textItems;

        private float horizontalPointer;

        public PdfTextRowBuilder(IPdfReportBuilder builder)
            : base(builder)
        {
            this.textItems = new List<TextItem>();
            this.horizontalPointer = 0f;
        }

        public IPdfTextRowBuilder WithIndent(float additionalIndent)
        {
            this.horizontalPointer += additionalIndent;
            return this;
        }

        public IPdfTextRowBuilder AtIndent(float indent)
        {
            this.horizontalPointer = indent;
            return this;
        }

        public IPdfTextRowBuilder AddText(string text, PdfStringFormat stringFormat) =>
            this.CreateTextElement(text, this.builder.Context.TextFont, this.builder.Context.TextBrush, stringFormat, false);

        public IPdfTextRowBuilder AddText(string text) =>
            this.CreateTextElement(text, this.builder.Context.TextFont, this.builder.Context.TextBrush, this.builder.Context.StringFormat, false);

        public IPdfTextRowBuilder AddHeader(string text, PdfStringFormat stringFormat) =>
            this.CreateTextElement(text, this.builder.Context.HeaderFont, this.builder.Context.HeaderBrush, stringFormat, false);

        public IPdfTextRowBuilder AddHeader(string text) =>
            this.CreateTextElement(text, this.builder.Context.HeaderFont, this.builder.Context.HeaderBrush, this.builder.Context.StringFormat, false);

        public IPdfTextRowBuilder AddHeaderHtml(string text) =>
            this.CreateTextElement(text, this.builder.Context.GetRegularFont(this.builder.Context.HeaderFont.Size), this.builder.Context.HeaderBrush, this.builder.Context.StringFormat, true);

        public IPdfTextRowBuilder AddTextHtml(string text) =>
            this.CreateTextElement(text, this.builder.Context.TextFont, this.builder.Context.TextBrush, this.builder.Context.StringFormat, true);

        public IPdfTextRowBuilder AddTextBold(string text) =>
            this.CreateTextElement(text, this.builder.Context.GetBoldFont(this.builder.Context.TextFont.Size), this.builder.Context.TextBrush, this.builder.Context.StringFormat, false);

        public override PdfComponentBuilderDrawAction BuildDrawAction()
        {
            var pageWidth = this.builder.GetPageBounds().Width;

            for (var i = 0; i < this.textItems.Count; i++)
            {
                var textItem = this.textItems[i];
                var nextIndent = i < this.textItems.Count - 1 ? this.textItems[i + 1].Indent : pageWidth;
                textItem.Width = nextIndent - textItem.Indent;
            }

            return new PdfComponentBuilderDrawAction(page =>
            {
                var layoutFormat = new PdfLayoutFormat
                {
                    Break = PdfLayoutBreakType.FitPage,
                    Layout = PdfLayoutType.Paginate,
                };

                var layoutResults = this.textItems.Select(textItem =>
                {
                    var location = new PointF(textItem.Indent, this.builder.VerticalPointer);
                    return textItem.PdfElement switch
                    {
                        PdfTextElement pdfTextElement => pdfTextElement.Draw(page, location, textItem.Width, layoutFormat),
                        PdfHTMLTextElement htmlTextElement => htmlTextElement.Draw(page, location, textItem.Width, layoutFormat),
                        _ => throw new NotSupportedException("Cannot draw unknown PdfElement"),
                    };
                }).ToList();

                var overflownLayoutResults = layoutResults.Where(result => result.Page != page).ToList();
                var incompleteLayoutResults = layoutResults.Where(result => result is PdfTextLayoutResult textResult && !string.IsNullOrEmpty(textResult.Remainder)).ToArray();

                if (incompleteLayoutResults.Length != 0)
                {
                    // Should not happen as long as we keep `Layout = PdfLayoutType.Paginate` in the provided `PdfLayoutFormat` for `Draw()`
                    throw new InvalidOperationException(
                        $"Some text has not been rendered:\n{string.Join('\n', incompleteLayoutResults.Aggregate("", (a, b) => a + ((PdfTextLayoutResult)b).Remainder))}");
                }

                if (overflownLayoutResults.Count != 0)
                {
                    layoutResults = overflownLayoutResults.Where(result => this.builder.IsCurrentPage(result.Page)).ToList();
                }

                var largestResult = layoutResults.MaxBy(result =>
                {
                    if (result is PdfTextLayoutResult textLayoutResult)
                    {
                        return (textLayoutResult.LastLineBounds.Y + textLayoutResult.LastLineBounds.Height) -
                               textLayoutResult.Bounds.Y;
                    }

                    return result.Bounds.Y + result.Bounds.Height;
                });

                return largestResult;
            });
        }

        private PdfTextRowBuilder CreateTextElement(string text, PdfFont pdfFont, PdfBrush pdfBrush, PdfStringFormat stringFormat, bool asHtml)
        {
            var format = stringFormat ?? this.builder.Context.StringFormat;
            var font = pdfFont ?? this.builder.Context.TextFont;
            var brush = pdfBrush ?? this.builder.Context.TextBrush;
            dynamic element = asHtml
                ? new PdfHTMLTextElement(text, font, brush)
                : new PdfTextElement(text, font, null, brush, format);

            this.textItems.Add(new TextItem
            {
                Indent = this.horizontalPointer,
                PdfElement = element,
            });
            return this;
        }

        private sealed class TextItem
        {
            public float Indent { get; init; }

            public dynamic PdfElement { get; init; }

            public float Width { get; set; }
        };
    }
}
