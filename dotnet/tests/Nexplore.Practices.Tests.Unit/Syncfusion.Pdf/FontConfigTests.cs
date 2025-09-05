namespace Nexplore.Practices.Tests.Unit.Syncfusion.Pdf
{
    using System;
    using System.IO;
    using global::Syncfusion.Pdf.Graphics;
    using Nexplore.Practices.Syncfusion.Pdf.Fonts;
    using Nexplore.Practices.Syncfusion.Pdf.ReportBuilder;
    using NUnit.Framework;

    [TestFixture]
    public class FontConfigTests
    {
        private sealed class CustomFontConfig : IFontConfig
        {
            public Stream Regular { get; } = LoadFont("LiberationMono-Regular.ttf");
            public Stream Bold { get; } = LoadFont("LiberationMono-Bold.ttf");
            public Stream Italic { get; } = LoadFont("LiberationMono-Italic.ttf");
            public Stream BoldItalic { get; } = LoadFont("LiberationMono-BoldItalic.ttf");

            private static Stream LoadFont(string fileName)
            {
                var thisTestType = typeof(FontConfigTests);

                return IFontConfig.LoadAssemblyEmbeddedFontFile(thisTestType.Assembly,
                    thisTestType.Namespace + ".Assets", fileName);
            }
        }

        [Test]
        public void ReportBuilderConfig_WithCustomFont_Initializes()
        {
            // Arrange
            var (fontSize, headerSize, margins) = GetPdfReportBuilderConfigDefaults();
            var fontConfig = new CustomFontConfig();

            // Act, Assert
            Assert.DoesNotThrow(() =>
            {
                using var config = new PdfReportBuilderConfig(fontSize, headerSize, fontConfig);
                using var builder = new PdfReportBuilder(config, margins);

                builder.AddHeader("Test 1 2 3");
                builder.AddText("Foo, bar, baz");

                using var stream = new MemoryStream();
                builder.AsPdfDocument().Save(stream);
            });
        }

        [Test]
        [Ignore("This test generates a sample Pdf file in the bin-dir of this test executable. This is not suitable for CI when running on testagents.")]
        public void ReportBuilderConfig_WithCustomFont_UsesCustomFontInReports()
        {
            // Arrange, Act
            var (fontSize, headerSize, margins) = GetPdfReportBuilderConfigDefaults();
            var fontConfig = new CustomFontConfig();
            using var config = new PdfReportBuilderConfig(fontSize, headerSize, fontConfig);
            using var builder = new PdfReportBuilder(config, margins);

            builder.AddHeader("Test 1 2 3");
            builder.AddText("Foo, bar, baz");

            using var stream = new MemoryStream();
            builder.AsPdfDocument().Save(stream);

            // Assert
            var outfilePath = Path.Join(Path.GetDirectoryName(Environment.ProcessPath),
                nameof(this.ReportBuilderConfig_WithCustomFont_UsesCustomFontInReports) + ".pdf");
            Assert.DoesNotThrow(() => File.WriteAllBytes(outfilePath, stream.ToArray()));
        }

        private static (float, float, PdfMargins) GetPdfReportBuilderConfigDefaults()
        {
            const float defaultFontSize = 10f;
            const float defaultHeaderSize = 13f;
            var margins = new PdfMargins
            {
                Left = 48,
                Bottom = 48,
                Top = 42,
                Right = 56,
            };

            return (defaultFontSize, defaultHeaderSize, margins);
        }
    }
}
