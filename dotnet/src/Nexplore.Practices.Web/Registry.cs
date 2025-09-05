namespace Nexplore.Practices.Web
{
    using Autofac;
    using Microsoft.Extensions.Localization;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Configuration;
    using Nexplore.Practices.Core.Services;
    using Nexplore.Practices.Web.Configuration;
    using Nexplore.Practices.Web.Localization;
    using Nexplore.Practices.Web.Services;
    using LocalizationOptions = Nexplore.Practices.Web.Localization.LocalizationOptions;

    public class Registry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            // Localization
            builder.RegisterType<ClientLocalizationService>().As<IClientLocalizationService>();
            builder.RegisterGeneric(typeof(StringLocalizerWithFallback<,>)).As(typeof(IStringLocalizer<,>)).InstancePerDependency();
            builder.RegisterType<ResourceManagerStringLocalizerFactory>().AsSelf().SingleInstance();
            builder.Register<IStringLocalizerFactory>(c => new PracticesStringLocalizerFactory(
                c.Resolve<IOptions<LocalizationOptions>>(),
                c.Resolve<ILogger<PracticesStringLocalizerFactory>>(),
                c.Resolve<ResourceManagerStringLocalizerFactory>()))
                .SingleInstance();

            // Http
            builder.RegisterType<HttpRequestService>().As<IHttpRequestService>().InstancePerLifetimeScope();
            builder.RegisterType<HttpContextService>().As<IHttpContextService>().InstancePerLifetimeScope();
            builder.RegisterType<CookieSessionDataProvider>().As<ISessionDataProvider>().InstancePerLifetimeScope();
            builder.RegisterType<CookieService>().As<ICookieService>().InstancePerLifetimeScope();

            // Load configuration
            builder.AddOption<ApiOptions>(ApiOptions.NAME);
            builder.AddOption<LocalizationOptions>(LocalizationOptions.NAME);
        }
    }
}
