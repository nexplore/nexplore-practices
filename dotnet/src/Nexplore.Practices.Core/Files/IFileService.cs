namespace Nexplore.Practices.Core.Files
{
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;

    public interface IFileService
    {
        Stream CreateTempFile();

        Task<Stream> CreateTempFileAsync(Stream input, CancellationToken cancellationToken = default);
    }
}
