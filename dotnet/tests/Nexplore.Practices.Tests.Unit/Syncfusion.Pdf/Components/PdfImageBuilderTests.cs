namespace Nexplore.Practices.Tests.Unit.Syncfusion.Pdf.Components
{
    using System.IO;
    using global::Syncfusion.Pdf.Parsing;
    using NUnit.Framework;

    [TestFixture]
    public class PdfImageBuilderTests : PdfReportBuilderTestsBase
    {
        [Test]
        public void AddImage_Once_AddsImageAtStart()
        {
            // Arrange
            using var documentStream = new MemoryStream();
            using var controlImageStream = new MemoryStream();

            const float linePadding = 1.55999756f;
            const string controlTextStart = "Foo";
            const string controlTextEnd = "Bar";

            var image = LoadImage();
            controlImageStream.Write(image);
            var requestedHeight = 100;

            // Act
            this.Builder.AddText(controlTextStart);
            this.Builder.CreateImage(b => b.WithImage(image, targetHeight: requestedHeight));
            this.Builder.AddText(controlTextEnd);
            this.Builder.AsPdfDocument().Save(documentStream);
            using var loadedDocument = new PdfLoadedDocument(documentStream);

            // Assert
            Assert.That(loadedDocument.FindText(controlTextStart, loadedDocument.PageCount - 1, out var controlStartResults), Is.True);
            Assert.That(loadedDocument.FindText(controlTextEnd, loadedDocument.PageCount - 1, out var controlEndResults), Is.True);

            var renderedHeight = controlEndResults[0].Top - (controlStartResults[0].Top + controlStartResults[0].Height) - this.Builder.Context.TextPadding - linePadding;
            AssertIsCloseTo(requestedHeight, renderedHeight);
        }

        [Test]
        public void AddImage_WithRestrictedHeight_AddsResizedImageAtStart()
        {
            // Arrange
            using var documentStream = new MemoryStream();
            using var controlImageStream = new MemoryStream();

            const int requestedHeight = 100;
            const float linePadding = 1.55999756f;
            const string controlTextStart = "Foo";
            const string controlTextEnd = "Bar";

            var image = LoadImage();
            controlImageStream.Write(image);

            // Act
            this.Builder.AddText(controlTextStart);
            this.Builder.CreateImage(b => b.WithImage(image, targetHeight: requestedHeight));
            this.Builder.AddText(controlTextEnd);
            this.Builder.AddText("LOL");
            this.Builder.AsPdfDocument().Save(documentStream);
            using var loadedDocument = new PdfLoadedDocument(documentStream);

            // Assert
            Assert.That(loadedDocument.FindText(controlTextStart, loadedDocument.PageCount - 1, out var controlStartResults), Is.True);
            Assert.That(loadedDocument.FindText(controlTextEnd, loadedDocument.PageCount - 1, out var controlEndResults), Is.True);

            var renderedHeight = controlEndResults[0].Top - (controlStartResults[0].Top + controlStartResults[0].Height) - this.Builder.Context.TextPadding - linePadding;

            AssertIsCloseTo(requestedHeight, renderedHeight);
        }

        private static byte[] LoadImage()
        {
            var rendererType = typeof(PdfImageBuilderTests);
            const string fileName = "test_image.png";
            var baseNamespace = rendererType.Namespace;
            var resourceName = $"{baseNamespace}.Assets.{fileName}";

            using var stream = rendererType.Assembly.GetManifestResourceStream(resourceName);
            using var memoryStream = new MemoryStream();

            stream!.CopyTo(memoryStream);

            return memoryStream.ToArray();
        }
    }
}
