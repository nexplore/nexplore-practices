namespace Nexplore.Practices.CommandLine.Code
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
