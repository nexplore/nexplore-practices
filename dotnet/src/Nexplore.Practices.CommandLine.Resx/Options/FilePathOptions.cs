namespace Nexplore.Practices.CommandLine.Resx.Options
{
    using System.IO;
    using Nexplore.Practices.CommandLine.Options;

    public class FilePathOption : CliOptionBase<FileSystemInfo>
    {
        public FilePathOption()
            : base("--file-path", "Defines the file path. This can be a path to just a folder (default filename is used) or to a file.", "-f")
        {
            this.Required = true;
        }
    }
}
