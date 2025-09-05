namespace Nexplore.Practices.Tests.Unit.Syncfusion.Pdf
{
    using System;
    using global::Syncfusion.Pdf.Graphics;
    using Nexplore.Practices.Syncfusion.Pdf.ReportBuilder;
    using NUnit.Framework;

    [TestFixture]
    public abstract class PdfReportBuilderTestsBase
    {
        private PdfReportBuilderConfig config;
        public PdfReportBuilder Builder { get; set; }

        [SetUp]
        public void Initialize()
        {
            const float fontSize = 10f;

            this.config = new PdfReportBuilderConfig(fontSize);
            this.Builder = new PdfReportBuilder(
                this.config,
                new PdfMargins
                {
                    Left = 48,
                    Bottom = 48,
                    Top = 42,
                    Right = 56,
                });
        }

        [TearDown]
        public void Teardown()
        {
            this.Builder.Dispose();
            this.config.Dispose();
        }

        protected static void AssertIsCloseTo(float actual, float expected, float tolerance = .005f)
        {
            var diff = Math.Abs(actual - expected);

            if (diff <= tolerance)
            {
                Assert.That(diff, Is.LessThanOrEqualTo(tolerance));
            }
            else
            {
                Assert.That(diff, Is.LessThanOrEqualTo(Math.Max(Math.Abs(actual), Math.Abs(expected)) * tolerance));
            }
        }
    }
}
