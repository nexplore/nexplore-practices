namespace Nexplore.Practices.Syncfusion.Pdf.ReportBuilder
{
    using System;
    using global::Syncfusion.Drawing;
    using global::Syncfusion.Pdf.Graphics;
    using Nexplore.Practices.Syncfusion.Pdf.Fonts;

    public class PdfReportBuilderConfig : IDisposable
    {
        private readonly FontContainer regularFonts;
        private readonly FontContainer italicFonts;
        private readonly FontContainer boldFonts;
        private readonly FontContainer boldItalicFonts;
        private readonly FontContainer headerFonts;

        public PdfReportBuilderConfig(float defaultFontSize)
            : this(defaultFontSize, defaultFontSize)
        {
        }

        public PdfReportBuilderConfig(float defaultFontSize, float headerFontSize, IFontConfig font = null)
        {
            font ??= new DefaultFont();

            var regular = font.Regular;
            this.regularFonts = new FontContainer(new PdfTrueTypeFont(regular, defaultFontSize));
            this.TextFont = this.regularFonts.Default;

            var italic = font.Italic;
            this.italicFonts = new FontContainer(new PdfTrueTypeFont(italic, defaultFontSize, PdfFontStyle.Italic));
            this.ItalicTextFont = this.italicFonts.Default;

            var bold = font.Bold;
            this.boldFonts = new FontContainer(new PdfTrueTypeFont(bold, defaultFontSize, PdfFontStyle.Bold));
            this.BoldTextFont = this.boldFonts.Default;

            var boldItalic = font.BoldItalic;
            this.boldItalicFonts =
                new FontContainer(new PdfTrueTypeFont(boldItalic, defaultFontSize, PdfFontStyle.Italic));

            this.headerFonts = new FontContainer(new PdfTrueTypeFont(bold, headerFontSize, PdfFontStyle.Bold));
            this.HeaderFont = this.headerFonts.Default;

            this.TextBrush = new PdfSolidBrush(Color.Black);
            this.HeaderBrush = new PdfSolidBrush(Color.Black);
            this.DividerPen = new PdfPen(Color.Black, 0.5f);

            this.StringFormat = new PdfStringFormat
            {
                LineSpacing = 0.25f,
                TextDirection = PdfTextDirection.LeftToRight,
                WordWrap = PdfWordWrapType.Word,
                Alignment = PdfTextAlignment.Left,
                LineAlignment = PdfVerticalAlignment.Top,
            };
        }

        public PdfTrueTypeFont TextFont { get; private set; }

        public PdfTrueTypeFont BoldTextFont { get; private set; }

        public PdfTrueTypeFont ItalicTextFont { get; private set; }

        public PdfSolidBrush TextBrush { get; set; }

        public PdfTrueTypeFont HeaderFont { get; private set; }

        public PdfSolidBrush HeaderBrush { get; set; }

        public PdfPen DividerPen { get; set; }

        public PdfStringFormat StringFormat { get; set; }

        public float TextPadding { get; set; } = 4f;

        public PdfTrueTypeFont GetRegularFont(float fontSize)
        {
            return this.regularFonts.GetFont(fontSize);
        }

        public PdfTrueTypeFont GetItalicFont(float fontSize)
        {
            return this.italicFonts.GetFont(fontSize);
        }

        public PdfTrueTypeFont GetBoldFont(float fontSize)
        {
            return this.boldFonts.GetFont(fontSize);
        }

        public PdfTrueTypeFont GetBoldItalicFont(float fontSize)
        {
            return this.boldItalicFonts.GetFont(fontSize);
        }

        public PdfTrueTypeFont GetHeaderFont(float fontSize)
        {
            return this.headerFonts.GetFont(fontSize);
        }

        public void SetHeaderFontSize(float fontSize)
        {
            this.HeaderFont = this.GetHeaderFont(fontSize);
        }

        public void SetHeaderFont(PdfTrueTypeFont font)
        {
            this.HeaderFont = font;
        }

        public void SetTextFontSize(float fontSize)
        {
            this.TextFont = this.GetRegularFont(fontSize);
        }

        public void SetTextFont(PdfTrueTypeFont font)
        {
            this.TextFont = font;
        }

        public void Dispose()
        {
            this.regularFonts.Dispose();
            this.italicFonts.Dispose();
            this.boldFonts.Dispose();
            this.headerFonts.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
