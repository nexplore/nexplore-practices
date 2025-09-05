namespace Nexplore.Practices.Tests.Unit.File
{
    using System.IO;
    using Nexplore.Practices.File;
    using NUnit.Framework;

    [TestFixture]
    public class FileServiceTests
    {
        [Test]
        public void CreateTemporaryFile_OnDispose_DeletesFile()
        {
            // Arrange
            var fileName = string.Empty;
            var service = new FileService();

            // Act
            using (var tempFileStream = service.CreateTempFile())
            {
                fileName = (tempFileStream as FileStream)?.Name;
                Assert.That(fileName, Is.Not.Null);
                Assert.That(File.Exists(fileName), Is.True);
            }

            // Assert
            Assert.That(File.Exists(fileName), Is.False);
        }
    }
}
