namespace Nexplore.Practices.File
{
    using Autofac;
    using Nexplore.Practices.Configuration;
    using Nexplore.Practices.Core.Files;

    public class Registry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterType<GZipCompressionService>().As<ICompressionService>().SingleInstance();
            builder.RegisterType<FileService>().As<IFileService>().SingleInstance();
            builder.RegisterType<MimeTypeMapping>().As<IMimeTypeMapping>().SingleInstance();

            // Load configuration
            builder.AddOption<FileOptions>(FileOptions.NAME);
        }
    }
}
