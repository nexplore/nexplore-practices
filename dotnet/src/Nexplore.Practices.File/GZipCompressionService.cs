namespace Nexplore.Practices.File
{
    using System;
    using System.IO;
    using System.IO.Compression;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.Core;
    using Nexplore.Practices.Core.Files;

    /// <summary>
    /// Implement file compression using GZip.
    /// </summary>
    public class GZipCompressionService : ICompressionService
    {
        private const int BUFFER_SIZE = 1024 * 4;

        public async Task<long> CompressAsync(Stream uncompressedInputStream, Stream compressedOutputStream, CancellationToken cancellationToken)
        {
            var sourceLength = 0L;

            await this.CompressAsync(compressedOutputStream, async (gzipStream, ct) =>
            {
                var buffer = new byte[BUFFER_SIZE];
                int read = await uncompressedInputStream.ReadAsync(buffer, 0, buffer.Length, ct).ConfigureAwait(false);

                while (read > 0)
                {
                    await gzipStream.WriteAsync(buffer, 0, read, ct).ConfigureAwait(false);

                    sourceLength += read;

                    read = await uncompressedInputStream.ReadAsync(buffer, 0, buffer.Length, ct).ConfigureAwait(false);
                }
            }, cancellationToken).ConfigureAwait(false);

            return sourceLength;
        }

        public async Task<long> DecompressAsync(Stream compressedInputStream, Stream uncompressedOutputStream, CancellationToken cancellationToken)
        {
            var destinationLength = 0L;

            await this.DecompressAsync(compressedInputStream, async (gzipStream, ct) =>
            {
                var buffer = new byte[BUFFER_SIZE];
                int read = await gzipStream.ReadAsync(buffer, 0, buffer.Length, ct).ConfigureAwait(false);

                while (read > 0)
                {
                    await uncompressedOutputStream.WriteAsync(buffer, 0, read, ct).ConfigureAwait(false);

                    destinationLength += read;

                    read = await gzipStream.ReadAsync(buffer, 0, buffer.Length, ct).ConfigureAwait(false);
                }
            }, cancellationToken).ConfigureAwait(false);

            return destinationLength;
        }

        public async Task CompressAsync(Stream outputStream, Func<Stream, CancellationToken, Task> streamCallback, CancellationToken cancellationToken)
        {
            using (var gzipStream = new GZipStream(outputStream, CompressionLevel.Optimal, true))
            {
                using (var bufferedInputStream = new BufferedStream(gzipStream))
                {
                    await streamCallback(bufferedInputStream, cancellationToken).ConfigureAwait(false);
                }
            }
        }

        public async Task DecompressAsync(Stream inputStream, Func<Stream, CancellationToken, Task> streamCallback, CancellationToken cancellationToken)
        {
            using (var gzipStream = new GZipStream(inputStream, CompressionMode.Decompress, true))
            {
                await streamCallback(gzipStream, cancellationToken).ConfigureAwait(false);
            }
        }

        public async Task<long> ProcessCompressionAsync(Stream inputStream, bool shouldBeCompressed, Stream outputStream, CancellationToken cancellationToken)
        {
            Guard.ArgumentNotNull(inputStream, nameof(inputStream));
            Guard.ArgumentNotNull(outputStream, nameof(outputStream));
            Guard.Assert(outputStream.CanSeek, "outputStream.CanSeek");

            long contentLength;
            if (shouldBeCompressed)
            {
                contentLength = await this.CompressAsync(inputStream, outputStream, cancellationToken).ConfigureAwait(false);
            }
            else
            {
                await inputStream.CopyToAsync(outputStream, cancellationToken).ConfigureAwait(false);
                contentLength = outputStream.Length;
            }

            outputStream.Position = 0;
            return contentLength;
        }
    }
}
