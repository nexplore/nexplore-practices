namespace Nexplore.Practices.Core.Files
{
    public interface IMimeTypeMapping
    {
        string GetContentTypeFromFileName(string fileName);
    }
}
