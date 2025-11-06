namespace Nexplore.Practices.Core.Files
{
    using System;
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;

    public interface ICompressionService
    {
        /// <summary>
        /// Compresses the input stream to the output stream.
        /// </summary>
        /// <param name="uncompressedInputStream">Input stream.</param>
        /// <param name="compressedOutputStream">Output stream.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Length of the input stream.</returns>
        Task<long> CompressAsync(Stream uncompressedInputStream, Stream compressedOutputStream, CancellationToken cancellationToken = default);

        /// <summary>
        /// Decompresses the input stream to the output stream.
        /// </summary>
        /// <param name="compressedInputStream">Input stream.</param>
        /// <param name="uncompressedOutputStream">Output stream.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Length of the output stream.</returns>
        Task<long> DecompressAsync(Stream compressedInputStream, Stream uncompressedOutputStream, CancellationToken cancellationToken = default);

        /// <summary>
        /// Compresses the input stream to the output stream.
        /// </summary>
        /// <param name="outputStream">Stream to write the compressed data into.</param>
        /// <param name="streamCallback">Callback to write uncompressed data into the stream.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Awaitable <see cref="Task"/>.</returns>
        Task CompressAsync(Stream outputStream, Func<Stream, CancellationToken, Task> streamCallback, CancellationToken cancellationToken = default);

        /// <summary>
        /// Decompresses the input stream to the output stream.
        /// </summary>
        /// <param name="inputStream">Stream to read compressed data from.</param>
        /// <param name="streamCallback">Callback to read uncompressed data.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Awaitable <see cref="Task"/>.</returns>
        Task DecompressAsync(Stream inputStream, Func<Stream, CancellationToken, Task> streamCallback, CancellationToken cancellationToken = default);

        /// <summary>
        /// Process file by coping the input stream to the output stream. Optionally the file will be compressed.
        /// </summary>
        /// <param name="inputStream">Input stream.</param>
        /// <param name="shouldBeCompressed"><c>true</c> if file should be compressed, <c>false</c> otherwise.</param>
        /// <param name="outputStream">Output stream.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Length of the output stream.</returns>
        Task<long> ProcessCompressionAsync(Stream inputStream, bool shouldBeCompressed, Stream outputStream, CancellationToken cancellationToken = default);
    }
}
