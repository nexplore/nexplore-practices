namespace Nexplore.Practices.Core.Scopes
{
    using System;
    using System.Collections.Generic;
    using Autofac.Core;
    using Autofac.Features.Decorators;

    public class AutofacChildScopeRegistrationSource : AutofacRegistrationSourceBase
    {
        private readonly Func<IChildScope> childScopeResolver;

        public AutofacChildScopeRegistrationSource(Func<IChildScope> childScopeResolver)
        {
            this.childScopeResolver = childScopeResolver;
        }

        public override IEnumerable<IComponentRegistration> RegistrationsFor(Service service, Func<Service, IEnumerable<ServiceRegistration>> registrationAccessor)
        {
            var serviceWithType = service as IServiceWithType;
            var isServiceOfCurrentLifetimeScope = serviceWithType != null && !(service is DecoratorService);

            if (isServiceOfCurrentLifetimeScope)
            {
                if (IsChildScopeType(serviceWithType.ServiceType))
                {
                    yield return CreateRegistration(service, serviceWithType.ServiceType, (c, p) => this.childScopeResolver());
                }
            }
        }

        private static bool IsChildScopeType(Type serviceType)
        {
            return typeof(IChildScope).IsAssignableFrom(serviceType);
        }
    }
}
