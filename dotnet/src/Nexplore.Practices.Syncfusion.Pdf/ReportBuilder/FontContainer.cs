namespace Nexplore.Practices.Syncfusion.Pdf.ReportBuilder
{
    using System;

    using System.Collections.Generic;
    using global::Syncfusion.Pdf.Graphics;

    internal sealed class FontContainer : IDisposable
    {
        private readonly IDictionary<float, PdfTrueTypeFont> fonts = new Dictionary<float, PdfTrueTypeFont>();
        private readonly PdfTrueTypeFont originalFont;

        public FontContainer(PdfTrueTypeFont originalFont)
        {
            this.originalFont = originalFont;
            this.fonts[originalFont.Size] = originalFont;
        }

        public PdfTrueTypeFont Default => this.originalFont;

        public PdfTrueTypeFont GetFont(float fontSize)
        {
            if (Math.Abs(this.originalFont.Size - fontSize) < 0.001f)
            {
                return this.originalFont;
            }

            if (!this.fonts.TryGetValue(fontSize, out var value))
            {
                value = new PdfTrueTypeFont(this.originalFont, fontSize);
                this.fonts[fontSize] = value;
            }

            return value;
        }

        public void Dispose()
        {
            foreach (var font in this.fonts.Values)
            {
                font.Dispose();
            }
        }
    }
}
