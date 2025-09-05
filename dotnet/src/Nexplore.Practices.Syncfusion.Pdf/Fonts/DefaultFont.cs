namespace Nexplore.Practices.Syncfusion.Pdf.Fonts
{
    using System.IO;

    public class DefaultFont : IFontConfig
    {
        public Stream Regular { get; } = LoadFont("LiberationSans-Regular.ttf");

        public Stream Bold { get; } = LoadFont("LiberationSans-Bold.ttf");

        public Stream Italic { get; } = LoadFont("LiberationSans-Italic.ttf");

        public Stream BoldItalic { get; } = LoadFont("LiberationSans-BoldItalic.ttf");

        private static Stream LoadFont(string fileName)
        {
            var fontType = typeof(DefaultFont);

            return IFontConfig.LoadAssemblyEmbeddedFontFile(fontType.Assembly, fontType.Namespace, fileName);
        }
    }
}
