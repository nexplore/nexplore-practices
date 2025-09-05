namespace Nexplore.Practices.Configuration
{
    using Autofac;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Options;

    public static class ContainerBuilderExtensions
    {
        public static void AddOption<TOptions>(this ContainerBuilder builder, string name)
            where TOptions : class
        {
            builder.Register(c => new ConfigurationChangeTokenSource<TOptions>(name, c.Resolve<IConfiguration>())).As(typeof(IOptionsChangeTokenSource<TOptions>)).SingleInstance();
            builder.Register(c => new ConfigureOptionsFromConfiguration<TOptions>(name, c.Resolve<IConfiguration>())).As(typeof(IConfigureOptions<TOptions>)).SingleInstance();
        }
    }
}
