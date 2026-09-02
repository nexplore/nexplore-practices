namespace Nexplore.Practices.CommandLine.Resx
{
    using System.IO;

    public interface IResourceSorterService
    {
        void Sort(FileSystemInfo filePath);
        void Validate(FileSystemInfo filePath);
    }
}
