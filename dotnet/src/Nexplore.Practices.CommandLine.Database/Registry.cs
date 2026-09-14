namespace Nexplore.Practices.CommandLine.Database
{
    using Autofac;
    using Nexplore.Practices.CommandLine.Commands;
    using Nexplore.Practices.CommandLine.Options;

    public class Registry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            var assembly = typeof(Registry).Assembly;

            // Cli commands and options
            builder.RegisterAssemblyTypes(assembly).Where(t => t.IsAssignableTo<ICliCommand>()).As<ICliCommand>().SingleInstance();
            builder.RegisterAssemblyTypes(assembly).Where(t => t.IsAssignableTo<ICliOption>()).As<ICliOption>().SingleInstance();
        }
    }
}
