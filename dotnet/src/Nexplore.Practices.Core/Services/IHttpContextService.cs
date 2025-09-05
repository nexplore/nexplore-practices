namespace Nexplore.Practices.Core.Services
{
    public interface IHttpContextService
    {
        void SetFileDownloadHeaders(string fileName, string contentType, long fileSize, string eTag = null, bool displayInline = true);
    }
}
