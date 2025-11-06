namespace Nexplore.Practices.Tests.Unit.Syncfusion.Pdf.Components
{
    using System.IO;
    using global::Syncfusion.Pdf.Graphics;
    using global::Syncfusion.Pdf.Parsing;
    using NUnit.Framework;

    [TestFixture]
    public class PdfDividerBuilderTests : PdfReportBuilderTestsBase
    {
        [Test]
        public void FromZero_AddsDividerAtStartWithoutPadding()
        {
            // Arrange
            var converter = new PdfUnitConverter();
            using var stream = new MemoryStream();

            const float linePadding = 7.335f;
            const string controlTextStart = "Foo";
            const string controlTextEnd = "Bar";

            // Act
            this.Builder.AddText(controlTextStart);
            this.Builder.CreateDivider(b => b.From(0));
            this.Builder.AddText(controlTextEnd);
            this.Builder.AsPdfDocument().Save(stream);
            using var loadedDocument = new PdfLoadedDocument(stream);

            // Assert
            Assert.That(loadedDocument.FindText(controlTextStart, loadedDocument.PageCount - 1, out var controlStartResults), Is.True);
            Assert.That(loadedDocument.FindText(controlTextEnd, loadedDocument.PageCount - 1, out var controlEndResults), Is.True);

            var unit = PdfGraphicsUnit.Point;
            var startTextTop = converter.ConvertToPixels(controlStartResults[0].Top, unit);
            var startTextHeight = converter.ConvertToPixels(controlStartResults[0].Height, unit) + linePadding;
            var endTextTop = converter.ConvertToPixels(controlEndResults[0].Top, unit);
            var renderedHeight = endTextTop - (startTextTop + startTextHeight);

            AssertIsCloseTo(renderedHeight, 0f);
        }

        [Test]
        public void FromZero_WithPadding_AddsDividerAtStartWithPadding()
        {
            // Arrange
            var converter = new PdfUnitConverter();
            using var stream = new MemoryStream();

            const float linePadding = 7.335f;
            const float preAndPostPadding = 4f;
            const string controlTextStart = "Foo";
            const string controlTextEnd = "Bar";

            // Act
            this.Builder.AddText(controlTextStart);
            this.Builder.CreateDivider(b => b.From(0).WithPadding(preAndPostPadding));
            this.Builder.AddSpacer(preAndPostPadding);
            this.Builder.AddText(controlTextEnd);
            this.Builder.AsPdfDocument().Save(stream);
            using var loadedDocument = new PdfLoadedDocument(stream);

            // Assert
            Assert.That(loadedDocument.FindText(controlTextStart, loadedDocument.PageCount - 1, out var controlStartResults), Is.True);
            Assert.That(loadedDocument.FindText(controlTextEnd, loadedDocument.PageCount - 1, out var controlEndResults), Is.True);

            var unit = PdfGraphicsUnit.Point;
            var startTextTop = converter.ConvertToPixels(controlStartResults[0].Top, unit);
            var startTextHeight = converter.ConvertToPixels(controlStartResults[0].Height, unit) + linePadding;
            var endTextTop = converter.ConvertToPixels(controlEndResults[0].Top, unit);
            var renderedHeight = endTextTop - (startTextTop + startTextHeight);

            var expectedHeight = converter.ConvertToPixels(preAndPostPadding * 2, unit);

            AssertIsCloseTo(renderedHeight, expectedHeight);
        }

        [Test]
        public void MultipleDividers_WithoutPadding_AddsDividerAtTheSameHeight()
        {
            // Arrange
            var converter = new PdfUnitConverter();
            using var stream = new MemoryStream();

            const float linePadding = 7.335f;
            const string controlTextStart = "Foo";
            const string controlTextEnd = "Bar";

            // Act
            this.Builder.AddText(controlTextStart);
            this.Builder.CreateDivider(b => b.From(0).To(20));
            this.Builder.CreateDivider(b => b.From(25).To(45));
            this.Builder.CreateDivider(b => b.From(50).To(70));
            this.Builder.CreateDivider(b => b.From(75).To(95));
            this.Builder.AddText(controlTextEnd);
            this.Builder.AsPdfDocument().Save(stream);
            using var loadedDocument = new PdfLoadedDocument(stream);

            // Assert
            Assert.That(loadedDocument.FindText(controlTextStart, loadedDocument.PageCount - 1, out var controlStartResults), Is.True);
            Assert.That(loadedDocument.FindText(controlTextEnd, loadedDocument.PageCount - 1, out var controlEndResults), Is.True);

            var unit = PdfGraphicsUnit.Point;
            var startTextTop = converter.ConvertToPixels(controlStartResults[0].Top, unit);
            var startTextHeight = converter.ConvertToPixels(controlStartResults[0].Height, unit) + linePadding;
            var endTextTop = converter.ConvertToPixels(controlEndResults[0].Top, unit);
            var renderedHeight = endTextTop - (startTextTop + startTextHeight);

            var expectedHeight = converter.ConvertToPixels(0, unit);

            AssertIsCloseTo(renderedHeight, expectedHeight);
        }
    }
}
