namespace Nexplore.Practices.File
{
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.Core.Files;

    public class FileService : IFileService
    {
        private const int BUFFER_SIZE = 1024 * 4;

        public Stream CreateTempFile()
        {
            return new FileStream(
                Path.GetTempFileName(),
                FileMode.OpenOrCreate,
                FileAccess.ReadWrite,
                FileShare.None,
                BUFFER_SIZE,
                System.IO.FileOptions.Asynchronous | System.IO.FileOptions.SequentialScan | System.IO.FileOptions.DeleteOnClose);
        }

        public async Task<Stream> CreateTempFileAsync(Stream input, CancellationToken cancellationToken)
        {
            var tempFileStream = this.CreateTempFile();
            await input.CopyToAsync(tempFileStream, cancellationToken).ConfigureAwait(false);
            tempFileStream.Position = 0;

            return tempFileStream;
        }
    }
}
