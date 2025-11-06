namespace Nexplore.Practices.Syncfusion.Pdf.ReportBuilder.Components
{
    using System;
    using System.IO;
    using global::Syncfusion.Drawing;
    using global::Syncfusion.Pdf.Graphics;
    using SixLabors.ImageSharp.Formats.Png;
    using Image = SixLabors.ImageSharp.Image;

    public interface IPdfImageBuilder
    {
        void WithImage(byte[] data);

        void WithImage(byte[] data, float targetHeight);

        void WithImage(byte[] data, float targetWidth, float targetHeight);

        void WithImage(byte[] data, float left, float top, float width, float height);

        void WithImage(byte[] data, RectangleF targetArea);
    }

    internal sealed class PdfImageBuilder : PdfComponentBuilderBase, IPdfImageBuilder
    {
        private Image image;
        private float? layoutWidth;
        private float? layoutHeight;
        private RectangleF? layoutRectangle;

        public PdfImageBuilder(IPdfReportBuilder builder)
            : base(builder)
        {
        }

        public void WithImage(byte[] data)
        {
            using var memoryStream = new MemoryStream(data);
            this.image = Image.Load(memoryStream);

            this.layoutRectangle = null;
            this.layoutWidth = null;
            this.layoutHeight = null;
        }

        public void WithImage(byte[] data, float targetHeight)
        {
            this.WithImage(data);
            this.layoutRectangle = null;
            this.layoutWidth = null;
            this.layoutHeight = targetHeight;
        }

        public void WithImage(byte[] data, float targetWidth, float targetHeight)
        {
            this.WithImage(data);
            this.layoutRectangle = null;
            this.layoutWidth = targetWidth;
            this.layoutHeight = targetHeight;
        }

        public void WithImage(byte[] data, float left, float top, float width, float height)
        {
            this.WithImage(data, new RectangleF(left, top, width, height));
        }

        public void WithImage(byte[] data, RectangleF targetArea)
        {
            this.WithImage(data);
            this.layoutRectangle = targetArea;
        }

        public override PdfComponentBuilderDrawAction BuildDrawAction()
        {
            using var stream = new MemoryStream();
            this.image.Save(stream, new PngEncoder());

            var pdfImage = PdfImage.FromStream(stream);
            var targetBounds = this.GetScaledTargetBounds(pdfImage.Width, pdfImage.Height, out var scaledTargetBounds);

            return new PdfComponentBuilderDrawAction(page =>
            {
                page.Graphics.DrawImage(pdfImage, scaledTargetBounds);
                return new PdfLayoutResult(page, targetBounds); // We return target bounds (and not scaledTargetBounds) so that the whole reserved area will stay blank
            });
        }

        private RectangleF GetScaledTargetBounds(float imageWidth, float imageHeight, out RectangleF scaledTargetBounds)
        {
            var targetBounds = this.GetTargetBounds(imageWidth, imageHeight);
            var scaleFactor = MathF.Min(1f, MathF.Min(targetBounds.Width / imageWidth, targetBounds.Height / imageHeight));
            scaledTargetBounds = new RectangleF(targetBounds.Location, new SizeF(scaleFactor * imageWidth, scaleFactor * imageHeight));

            return targetBounds;
        }

        private RectangleF GetTargetBounds(float imageWidth, float imageHeight)
        {
            if (this.layoutRectangle.HasValue)
            {
                return this.layoutRectangle.Value;
            }

            if (this.layoutWidth.HasValue && this.layoutHeight.HasValue)
            {
                return new RectangleF(0, this.builder.VerticalPointer, this.layoutWidth.Value, this.layoutHeight.Value);
            }

            if (this.layoutHeight.HasValue)
            {
                return new RectangleF(0, this.builder.VerticalPointer, this.builder.GetPageBounds().Width, this.layoutHeight.Value);
            }

            return new RectangleF(0, this.builder.VerticalPointer, imageWidth, imageHeight);
        }
    }
}
