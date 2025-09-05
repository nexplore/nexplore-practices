namespace Nexplore.Practices.Tests.Unit.File
{
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using Microsoft.AspNetCore.StaticFiles;
    using Microsoft.Extensions.Logging.Abstractions;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.File;
    using NUnit.Framework;

    [TestFixture]
    public class MimeTypeMappingTests
    {
        private const string TEST_MIME_TYPE = "application/test";

        private MimeTypeMapping mimeTypeMapping;

        [SetUp]
        public void Initialize()
        {
            var mappings = new Dictionary<string, string>();
            mappings.Add(".test", TEST_MIME_TYPE);
            var options = Options.Create(new FileOptions { AdditionalMimeTypeMappings = mappings });

            this.mimeTypeMapping = new MimeTypeMapping(new FileExtensionContentTypeProvider(), new NullLogger<MimeTypeMapping>(), options);
        }

        [TestCaseSource(typeof(MimeTypeMappingTests), nameof(AllContentTypeTests))]
        public string GetContentTypeFromFilename_WithFilename_ReturnsCorrectMimeType(string fileName)
        {
            // Act
            var contentType = this.mimeTypeMapping.GetContentTypeFromFileName(fileName);

            // Assert
            return contentType;
        }

        [Test]
        public void GetContentTypeFromFilename_WithoutEmptyFilename_ShouldThrowException()
        {
            // Act
            TestDelegate act = () => this.mimeTypeMapping.GetContentTypeFromFileName(string.Empty);

            // Assert
            Assert.That(act, Throws.Exception.InstanceOf<ArgumentException>());
        }

        [Test]
        public void GetContentTypeFromFilename_WithoutNullFilename_ShouldThrowException()
        {
            // Act
            TestDelegate act = () => this.mimeTypeMapping.GetContentTypeFromFileName(null);

            // Assert
            Assert.That(act, Throws.Exception.InstanceOf<ArgumentNullException>());
        }

        private static IEnumerable AllContentTypeTests()
        {
            yield return new TestCaseData("unknown").Returns(MimeTypeMapping.DEFAULT_MIME_TYPE);
            yield return new TestCaseData("unknown.extension").Returns(MimeTypeMapping.DEFAULT_MIME_TYPE);
            yield return new TestCaseData("pdf").Returns(MimeTypeMapping.DEFAULT_MIME_TYPE);
            yield return new TestCaseData("with.muliple.points.pdf").Returns("application/pdf");
            yield return new TestCaseData("file.test").Returns(TEST_MIME_TYPE);
        }
    }
}
