namespace Nexplore.Practices.Serilog
{
    using Autofac;
    using global::Serilog.Extensions.Logging;
    using Microsoft.Extensions.Logging;
    using Nexplore.Practices.Core;

    public class Registry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterType<SerilogLoggerBuilder>().As<ILoggerBuilder>().SingleInstance();
            builder.RegisterType<SerilogLoggerFactory>().As<ILoggerFactory>().SingleInstance();
            builder.RegisterType<CorrelationIdEnricher>().AsSelf().InstancePerDependency();
            builder.RegisterType<UserIdEnricher>().AsSelf().InstancePerDependency();
            builder.RegisterType<MachineNameEnricher>().AsSelf().SingleInstance();
        }
    }
}
