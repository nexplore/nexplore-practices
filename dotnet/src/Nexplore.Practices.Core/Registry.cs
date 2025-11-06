namespace Nexplore.Practices.Core
{
    using Autofac;
    using Autofac.Core.Lifetime;
    using Nexplore.Practices.Core.Administration;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.Core.Security.Cryptography;
    using Nexplore.Practices.Core.Validation;

    public class Registry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            // Configure global services
            builder.RegisterType<LocalComputerClock>().As<IClock>().SingleInstance();
            builder.RegisterType<EncryptionService>().As<IEncryptionService>().SingleInstance();
            builder.RegisterType<StaticSaltGenerationService>().As<ISaltGenerationService>().SingleInstance();
            builder.RegisterType<ValidationHelper>().As<IValidationHelper>().SingleInstance();

            // Configure administration
            builder.Register<IUserInfoResolver>(c => new UserInfoResolver(new SystemUserInfo())).InstancePerMatchingLifetimeScope(LifetimeScope.RootTag, PracticesConstants.Scopes.TOP_LEVEL_CHILD_SCOPE_TAG);
            builder.RegisterType<SimpleUser>().As<IUser>().InstancePerLifetimeScope();

            // Configure child scopes
            builder.RegisterGeneric(typeof(ChildScopeFactory<>)).As(typeof(IChildScopeFactory<>)).InstancePerDependency();
            builder.RegisterGeneric(typeof(ChildScopeFactory<,>)).As(typeof(IChildScopeFactory<,>)).InstancePerDependency();
            builder.RegisterGeneric(typeof(ChildScopeFactory<,,>)).As(typeof(IChildScopeFactory<,,>)).InstancePerDependency();
        }
    }
}
