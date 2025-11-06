using System.IO;
using Nuke.Common.IO;

namespace Nexplore.Practices.Build.Helpers;

public static class FileHelpers
{
    public static void ReplaceContent(this AbsolutePath file, string oldValue, string newValue)
    {
        var content = File.ReadAllText(file);
        content = content.Replace(oldValue, newValue);
        File.WriteAllText(file, content);
    }
}
