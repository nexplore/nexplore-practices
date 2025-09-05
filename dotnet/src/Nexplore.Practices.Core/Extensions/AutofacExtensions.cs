namespace Nexplore.Practices.Core.Extensions
{
    using System;
    using Autofac;
    using Autofac.Core;
    using Nexplore.Practices.Core.Scopes;

    public static class AutofacExtensions
    {
        public static Action<ContainerBuilder> AddRegistrationSources(Action<ContainerBuilder> lifetimeScopeConfigurationAction, params IRegistrationSource[] registrationSources)
        {
            return builder =>
            {
                foreach (var registrationSource in registrationSources)
                {
                    builder.RegisterSource(registrationSource);
                }

                lifetimeScopeConfigurationAction?.Invoke(builder);
            };
        }

        public static ILifetimeScope BeginChildLifetimeScope(ILifetimeScope parentLifetimeScope, Action<ContainerBuilder> lifetimeScopeConfigurationAction)
        {
            var isTopLevelScope = parentLifetimeScope.ResolveOptional<IChildScope>() == null;

            return isTopLevelScope
                ? parentLifetimeScope.BeginLifetimeScope(PracticesConstants.Scopes.TOP_LEVEL_CHILD_SCOPE_TAG, lifetimeScopeConfigurationAction)
                : parentLifetimeScope.BeginLifetimeScope(lifetimeScopeConfigurationAction);
        }
    }
}
