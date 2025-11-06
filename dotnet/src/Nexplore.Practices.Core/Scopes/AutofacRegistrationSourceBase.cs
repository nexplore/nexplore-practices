namespace Nexplore.Practices.Core.Scopes
{
    using System;
    using System.Collections.Generic;
    using Autofac;
    using Autofac.Core;
    using Autofac.Core.Activators.Delegate;
    using Autofac.Core.Lifetime;
    using Autofac.Core.Registration;

    public abstract class AutofacRegistrationSourceBase : IRegistrationSource
    {
        public virtual bool IsAdapterForIndividualComponents => false;

        public abstract IEnumerable<IComponentRegistration> RegistrationsFor(
            Service service,
            Func<Service, IEnumerable<ServiceRegistration>> registrationAccessor);

        protected static ComponentRegistration CreateRegistration(Service service, Type serviceType, Func<IComponentContext, IEnumerable<Parameter>, object> factory)
        {
            return new ComponentRegistration(
                Guid.NewGuid(),
                new DelegateActivator(serviceType, factory),
                new CurrentScopeLifetime(),
                InstanceSharing.None,
                InstanceOwnership.OwnedByLifetimeScope,
                new[] { service },
                new Dictionary<string, object>());
        }
    }
}
