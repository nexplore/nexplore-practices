namespace Nexplore.Practices.CommandLine.Resx
{
    using Autofac;

    public class Registry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            // Services
            builder.RegisterType<ResourceSorterService>().As<IResourceSorterService>().InstancePerLifetimeScope();
        }
    }
}
