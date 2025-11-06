namespace Nexplore.Practices.Tests.Unit.Syncfusion.Pdf
{
    using System.IO;
    using global::Syncfusion.Pdf.Parsing;
    using NUnit.Framework;

    [TestFixture]
    public class PdfReportBuilderTests : PdfReportBuilderTestsBase
    {
        [Test]
        public void NewPage_AddsNewPage()
        {
            // Arrange

            // Act
            this.Builder.NewPage();

            // Assert
            Assert.That(this.Builder.AsPdfDocument().PageCount, Is.EqualTo(2));
        }

        [Test]
        public void ReserveGraphics_WithOverflowingAmount_AddsNewPage()
        {
            // Arrange
            var page = this.Builder.AsPdfDocument().Pages[^1];
            var pageHeight = page.GetClientSize().Height;

            // Act
            this.Builder.AddSpacer(pageHeight + 1);

            // Assert
            Assert.That(this.Builder.AsPdfDocument().PageCount, Is.EqualTo(2));
        }

        [Test]
        public void ReserveGraphics_WithFittingAmount_DoesNotAddNewPage()
        {
            // Arrange
            var page = this.Builder.AsPdfDocument().Pages[^1];
            var pageHeight = page.GetClientSize().Height;

            // Act
            this.Builder.AddSpacer(pageHeight - 1);

            // Assert
            Assert.That(this.Builder.AsPdfDocument().PageCount, Is.EqualTo(1));
        }

        [Test]
        public void AddSpacer_WithAmount_AddsSpacer()
        {
            // Arrange
            var page = this.Builder.AsPdfDocument().Pages[^1];
            var pageHeight = page.GetClientSize().Height;

            // Act
            this.Builder.AddSpacer(pageHeight + 1);

            // Assert
            Assert.That(this.Builder.AsPdfDocument().PageCount, Is.EqualTo(2));
        }

        [Test]
        public void UseFooterWithPageNumbers_ReturnsDocumentWithPageNumbers()
        {
            // Arrange
            using var stream = new MemoryStream();
            this.Builder.NewPage();
            this.Builder.NewPage();
            this.Builder.NewPage();

            this.Builder.UseFooterWithPageNumbers();

            // Act
            this.Builder.AsPdfDocument().Save(stream);
            using var loadedDocument = new PdfLoadedDocument(stream);

            // Assert
            for (var i = 0; i < loadedDocument.Pages.Count; i++)
            {
                Assert.That(loadedDocument.FindText($"{i + 1} / {loadedDocument.PageCount}", i, out _), Is.True);
            }
        }

        [Test]
        public void UseFooterWithPageNumbers_WithTopPadding_ReturnsDocumentWithPageNumbersAndTallFooter()
        {
            // Arrange
            const string footerText = "SAMPLE FOOTER";
            const string controlText = "Foo";
            const string text = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."; // <-- Has no line-breaks

            using var stream = new MemoryStream();
            var almostHalfOfPageHeight = this.Builder.GetPageBounds().Height * 0.4f;

            this.Builder.UseFooterWithPageNumbers(footerText, "{0} / {1}", topPadding: almostHalfOfPageHeight);
            this.Builder.SetVerticalPointer(almostHalfOfPageHeight);
            this.Builder.CreateTextRow(b => b.AddText(text).WithIndent(40).AddText(controlText));

            // Act
            this.Builder.AsPdfDocument().Save(stream);
            using var loadedDocument = new PdfLoadedDocument(stream);

            // Assert
            var lastPageNumber = loadedDocument.PageCount - 1;
            Assert.That(loadedDocument.PageCount == 4, Is.True, "Long text and large footer should enforce multiple pages");
            Assert.That(loadedDocument.FindText(text[^3..], lastPageNumber, out var textResultsEnd), Is.True);
            Assert.That(loadedDocument.FindText(footerText, lastPageNumber, out var footerResults), Is.True);

            var textResultEnd = textResultsEnd[^1];
            var footerResult = footerResults[^1];

            Assert.That(footerResult.Y > textResultEnd.Y, Is.True, "Footertext should appear after the final chars of the Textfield");
        }
    }
}
