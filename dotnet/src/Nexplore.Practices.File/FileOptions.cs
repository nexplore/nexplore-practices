namespace Nexplore.Practices.File
{
    using System.Collections.Generic;

    public class FileOptions
    {
        public const string NAME = "File";

        public Dictionary<string, string> AdditionalMimeTypeMappings { get; set; } = new();
    }
}
