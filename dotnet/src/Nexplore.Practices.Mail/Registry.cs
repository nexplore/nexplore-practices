namespace Nexplore.Practices.Mail
{
    using Autofac;
    using Nexplore.Practices.Configuration;

    public class Registry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterType<MailService>().As<IMailService>().SingleInstance();

            // Load configuration
            builder.AddOption<MailOptions>(MailOptions.NAME);
        }
    }
}
