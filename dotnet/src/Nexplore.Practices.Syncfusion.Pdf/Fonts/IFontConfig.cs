namespace Nexplore.Practices.Syncfusion.Pdf.Fonts
{
    using System.IO;
    using System.Reflection;

    public interface IFontConfig
    {
        public Stream Regular { get; }

        public Stream Bold { get; }

        public Stream Italic { get; }

        public Stream BoldItalic { get; }

        public static Stream LoadAssemblyEmbeddedFontFile(Assembly assembly, string namespacePath, string fileName)
        {
            return assembly.GetManifestResourceStream($"{namespacePath}.{fileName}");
        }
    }
}