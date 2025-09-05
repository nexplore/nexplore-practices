namespace Nexplore.Practices.Tests.Unit.Syncfusion.Pdf.Components
{
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using global::Syncfusion.Drawing;
    using global::Syncfusion.Pdf.Parsing;
    using NUnit.Framework;

    [TestFixture]
    public class PdfTextRowBuilderTests : PdfReportBuilderTestsBase
    {
        [Test]
        public void AddText_Once_AddsTextAtStart()
        {
            // Arrange
            using var stream = new MemoryStream();
            var leftMargin = this.Builder.GetPageSettings().Margins.Left;
            const string text = "Foo";

            // Act
            this.Builder.AddText(text);
            this.Builder.AsPdfDocument().Save(stream);
            using var loadedDocument = new PdfLoadedDocument(stream);

            // Assert
            Assert.That(loadedDocument.FindText(text, loadedDocument.PageCount - 1, out var results), Is.True);
            Assert.That(leftMargin, Is.EqualTo(results[0].Left));
        }

        [Test]
        public void AddHeader_Once_AddsTextAtStart()
        {
            // Arrange
            using var stream = new MemoryStream();
            var leftMargin = this.Builder.GetPageSettings().Margins.Left;
            const string text = "Foo";

            // Act
            this.Builder.AddHeader(text);
            this.Builder.AsPdfDocument().Save(stream);
            using var loadedDocument = new PdfLoadedDocument(stream);

            // Assert
            Assert.That(loadedDocument.FindText(text, loadedDocument.PageCount - 1, out var results), Is.True);
            Assert.That(leftMargin, Is.EqualTo(results[0].Left));
        }

        [Test]
        public void AddText_WithIndents_AddsIndentedText()
        {
            // Arrange
            using var stream = new MemoryStream();
            var leftMargin = this.Builder.GetPageSettings().Margins.Left;
            const string text = "Foo";
            const float tab1 = 10f;
            const float tab2 = 5f;

            // Act
            this.Builder.CreateTextRow(b => b.WithIndent(tab1).WithIndent(tab2).AddText(text));
            this.Builder.AsPdfDocument().Save(stream);
            using var loadedDocument = new PdfLoadedDocument(stream);

            // Assert
            Assert.That(loadedDocument.FindText(text, loadedDocument.PageCount - 1, out var results), Is.True);
            Assert.That(leftMargin + tab1 + tab2, Is.EqualTo(results[0].Left));
        }

        [Test]
        public void AddHeader_WithIndents_AddsIndentedHeader()
        {
            // Arrange
            using var stream = new MemoryStream();
            var leftMargin = this.Builder.GetPageSettings().Margins.Left;
            const string text = "Foo";
            const float tab1 = 10f;
            const float tab2 = 5f;

            // Act
            this.Builder.CreateTextRow(b => b.WithIndent(tab1).WithIndent(tab2).AddHeader(text));
            this.Builder.AsPdfDocument().Save(stream);
            using var loadedDocument = new PdfLoadedDocument(stream);

            // Assert
            Assert.That(loadedDocument.FindText(text, loadedDocument.PageCount - 1, out var results), Is.True);
            Assert.That(leftMargin + tab1 + tab2, Is.EqualTo(results[0].Left));
        }

        [Test]
        public void AddText_AtIndent_AddsIndentedText()
        {
            // Arrange
            using var stream = new MemoryStream();
            var leftMargin = this.Builder.GetPageSettings().Margins.Left;
            const string text = "Foo";
            const float tab1 = 10f;
            const float tab2 = 5f;

            // Act
            this.Builder.CreateTextRow(b => b.WithIndent(tab1).AtIndent(tab2).AddText(text));
            this.Builder.AsPdfDocument().Save(stream);
            using var loadedDocument = new PdfLoadedDocument(stream);

            // Assert
            Assert.That(loadedDocument.FindText(text, loadedDocument.PageCount - 1, out var results), Is.True);
            Assert.That(leftMargin + tab2, Is.EqualTo(results[0].Left)); // <-- Absolutely positioned, so the first indent is ignored
        }

        [Test]
        public void AddHeader_AtIndent_AddsIndentedText()
        {
            // Arrange
            using var stream = new MemoryStream();
            var leftMargin = this.Builder.GetPageSettings().Margins.Left;
            const string text = "Foo";
            const float tab1 = 10f;
            const float tab2 = 5f;

            // Act
            this.Builder.CreateTextRow(b => b.WithIndent(tab1).AtIndent(tab2).AddHeader(text));
            this.Builder.AsPdfDocument().Save(stream);
            using var loadedDocument = new PdfLoadedDocument(stream);

            // Assert
            Assert.That(loadedDocument.FindText(text, loadedDocument.PageCount - 1, out var results), Is.True);
            Assert.That(leftMargin + tab2, Is.EqualTo(results[0].Left)); // <-- Absolutely positioned, so the first indent is ignored
        }

        [Test]
        public void AddText_WithLinebreaks_AffectsRequiredHeight()
        {
            // Arrange
            using var stream = new MemoryStream();
            const string controlText = "Lorem ipsum dolor sit amet,";
            const string text = "consetetur sadipscjng elitr,\nsed diam nonumy eirmod tempor invidunt";
            var size = this.Builder.Context.TextFont.MeasureString(controlText);

            // Act
            this.Builder.CreateTextRow(b => b.AddText(controlText).WithIndent(size.Width * 1.1f).AddText(text));
            this.Builder.AsPdfDocument().Save(stream);
            using var loadedDocument = new PdfLoadedDocument(stream);

            // Assert
            Assert.That(loadedDocument.FindText(controlText, loadedDocument.PageCount - 1, out var controlResults), Is.True);
            Assert.That(loadedDocument.FindText(text.Split('\n').ToList(), loadedDocument.PageCount - 1, out var textResults), Is.True);

            var controlResult = controlResults[0];
            var textResult = new RectangleF(
                textResults[0].Bounds.Left,
                textResults[0].Bounds.Top,
                textResults[0].Bounds.Width > textResults[1].Bounds.Width ? textResults[0].Bounds.Width : textResults[1].Bounds.Width,
                textResults[0].Bounds.Height + textResults[1].Bounds.Height);

            Assert.That(controlResult.Height, Is.LessThanOrEqualTo(size.Height));
            Assert.That(controlResult.Height * 2, Is.EqualTo(textResult.Height));
        }

        [Test]
        public void AddText_WithLongText_AddsSufficientLinebreaksAndDoesNotOverflow()
        {
            // Arrange
            using var stream = new MemoryStream();
            const string controlText = "Foo";
            const string text = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."; // <-- Has no line-breaks

            var availableWidth = this.Builder.AsPdfDocument().Pages[^1].GetClientSize().Width;
            var tab = availableWidth / 2;

            // Act
            this.Builder.CreateTextRow(b => b.AddText(controlText).WithIndent(tab).AddText(text));
            this.Builder.AsPdfDocument().Save(stream);
            using var loadedDocument = new PdfLoadedDocument(stream);

            // Assert
            Assert.That(loadedDocument.FindText(controlText, loadedDocument.PageCount - 1, out var controlResults), Is.True);
            Assert.That(loadedDocument.FindText(text[..30], loadedDocument.PageCount - 1, out var textResultsStart), Is.True);
            Assert.That(loadedDocument.FindText(text[^21..], loadedDocument.PageCount - 1, out var textResultsEnd), Is.True);

            var controlResult = controlResults[0];
            var textResultStart = textResultsStart[0];
            var textResultEnd = textResultsEnd[^1];

            Assert.That(textResultStart.Top, Is.EqualTo(controlResult.Top), message: "Row cells must start at the same height");
            Assert.That(textResultStart.Height, Is.EqualTo(controlResult.Height), message: "First line of text must be the same height as a single-line cell");

            Assert.That(textResultEnd.Left, Is.EqualTo(textResultStart.Left), message: "Line of a cell which contains line-broken strings must start at the same 'Left' position");
            Assert.That(textResultStart.Top, Is.LessThan(textResultEnd.Top), message: "Last line of a cell which contains line-broken strings must be lower than the first line of the same cell");

            // Get bounding box of cell and make assertions based on its dimensions
            var textResultBoundingBoxLeft = float.MaxValue;
            var textResultBoundingBoxRight = float.MaxValue;
            var textResultBoundingBoxTop = float.MaxValue;
            var textResultBoundingBoxBottom = float.MaxValue;

            // Test if a boundary is not within the control-text draw location. This allows us to ignore text matches within the Syncfusion
            // watermark.
            bool MatchedInWatermark(RectangleF test) => test.Top < controlResult.Top || test.Top > (textResultEnd.Top + textResultEnd.Height);

            var words = new HashSet<string>(text.Split(' '));
            foreach (var word in words)
            {
                // TODO: Somehow the current version of syncfusion does not find words with length 1 or 2
                if (word.Length <= 2)
                {
                    continue;
                }

                Assert.That(loadedDocument.FindText(word, loadedDocument.PageCount - 1, out var wordResults), Is.True);
                foreach (var wordResult in wordResults.Where(wordResult => !MatchedInWatermark(wordResult)))
                {
                    textResultBoundingBoxLeft = wordResult.Left < textResultBoundingBoxLeft ? wordResult.Left : textResultBoundingBoxLeft;
                    textResultBoundingBoxRight = wordResult.Right < textResultBoundingBoxRight ? wordResult.Right : textResultBoundingBoxRight;
                    textResultBoundingBoxTop = wordResult.Top < textResultBoundingBoxTop ? wordResult.Top : textResultBoundingBoxTop;
                    textResultBoundingBoxBottom = wordResult.Bottom < textResultBoundingBoxBottom ? wordResult.Bottom : textResultBoundingBoxBottom;
                }
            }

            Assert.That(textResultBoundingBoxLeft, Is.GreaterThan(controlResult.Left + controlResult.Width), message: "Cells which contain line-broken strings cannot overlap left adjacent cells");
            Assert.That(textResultBoundingBoxRight, Is.GreaterThanOrEqualTo(0), message: "Cells which contain line-broken strings cannot overflow page margins horizontally");
            Assert.That(textResultBoundingBoxTop, Is.GreaterThan(0), message: "Cells which contain line-broken strings cannot underflow page margins vertically");
        }

        [Test]
        public void AddText_WithMultiplePageOverflowingColumns_AddsSufficientPages()
        {
            // Arrange
            using var stream = new MemoryStream();
            const string controlText = "Foo";
            const string text = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."; // <-- Has no line-breaks

            var availableWidth = this.Builder.AsPdfDocument().Pages[^1].GetClientSize().Width;
            var tab1 = 20;
            var tab2 = 30;
            var tabRest = availableWidth - tab1 - tab2;

            // Act
            this.Builder.CreateTextRow(b =>
                b.AddText(text).WithIndent(20).AddText(text).WithIndent(30).AddText("Shishi").WithIndent(tabRest));
            this.Builder.CreateTextRow(b => b.AddText(controlText));
            this.Builder.AsPdfDocument().Save(stream);
            using var loadedDocument = new PdfLoadedDocument(stream);

            // Assert
            var lastPageNumber = loadedDocument.PageCount - 1;
            Assert.That(lastPageNumber > 1, Is.True);
            // ame + t. is rendered on two lines. FindText used to find it. It does not find it on two lines anymore in the current version.
            Assert.That(loadedDocument.FindText("ame", lastPageNumber, out _), Is.True);
            Assert.That(loadedDocument.FindText("t.", lastPageNumber, out _), Is.True);
            Assert.That(loadedDocument.FindText(controlText, lastPageNumber, out _), Is.True);
        }
    }
}
