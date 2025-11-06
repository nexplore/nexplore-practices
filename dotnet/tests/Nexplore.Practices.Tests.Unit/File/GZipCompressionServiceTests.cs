namespace Nexplore.Practices.Tests.Unit.File
{
    using System.IO;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.File;
    using NUnit.Framework;

    [TestFixture]
    public class GZipCompressionServiceTests
    {
        [Test]
        public async Task CompressAndDecompress_WithSampleData_ResultEqualsInitialData()
        {
            // Arrange
            var inputDataString = "Hello World!";
            var inputData = Encoding.UTF8.GetBytes(inputDataString);
            var service = new GZipCompressionService();

            using (var inputStream = new MemoryStream(inputData))
            using (var compressedOutput = new MemoryStream())
            {
                // Act
                var inputSize = await service.CompressAsync(inputStream, compressedOutput, CancellationToken.None);

                // Assert
                Assert.That(inputSize, Is.EqualTo(inputStream.Length));
                Assert.That(inputSize, Is.Not.EqualTo(compressedOutput.Length));

                // Arrange
                compressedOutput.Position = 0;
                using (var decompressedOutput = new MemoryStream())
                {
                    // Act
                    var decompressedSize = await service.DecompressAsync(compressedOutput, decompressedOutput, CancellationToken.None);

                    // Assert
                    Assert.That(decompressedSize, Is.EqualTo(inputStream.Length));
                    decompressedOutput.Position = 0;
                    using (var streamReader = new StreamReader(decompressedOutput))
                    {
                        Assert.That(await streamReader.ReadToEndAsync(), Is.EqualTo(inputDataString));
                    }
                }
            }
        }
    }
}
