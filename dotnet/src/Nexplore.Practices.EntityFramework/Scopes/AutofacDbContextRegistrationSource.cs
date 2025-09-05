namespace Nexplore.Practices.EntityFramework.Scopes
{
    using System;
    using System.Collections.Generic;
    using System.Linq.Expressions;
    using System.Reflection;
    using Autofac.Core;
    using Autofac.Features.Decorators;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.ChangeTracking;
    using Microsoft.EntityFrameworkCore.Infrastructure;
    using Microsoft.EntityFrameworkCore.Metadata;
    using Nexplore.Practices.Core.Scopes;

    public class AutofacDbContextRegistrationSource : AutofacRegistrationSourceBase
    {
        private static readonly MethodInfo dbSetMethod = typeof(DbContext).GetMethod("Set", Array.Empty<Type>());

        private readonly Func<DbContext> dbContextResolver;

        public AutofacDbContextRegistrationSource(Func<DbContext> dbContextResolver)
        {
            this.dbContextResolver = dbContextResolver;
        }

        public override IEnumerable<IComponentRegistration> RegistrationsFor(Service service, Func<Service, IEnumerable<ServiceRegistration>> registrationAccessor)
        {
            var serviceWithType = service as IServiceWithType;
            var isServiceOfCurrentLifetimeScope = serviceWithType != null && !(service is DecoratorService);

            if (isServiceOfCurrentLifetimeScope)
            {
                if (IsDbSet(serviceWithType.ServiceType))
                {
                    var entityType = serviceWithType.ServiceType.GetGenericArguments()[0];
                    var entityDbSetResolver = DbSetResolver(entityType);

                    yield return CreateRegistration(service, serviceWithType.ServiceType, (c, p) => entityDbSetResolver(this.dbContextResolver()));
                }
                else if (Is<DatabaseFacade>(serviceWithType.ServiceType))
                {
                    yield return CreateRegistration(service, serviceWithType.ServiceType, (c, p) => this.dbContextResolver().Database);
                }
                else if (Is<IModel>(serviceWithType.ServiceType))
                {
                    yield return CreateRegistration(service, serviceWithType.ServiceType, (c, p) => this.dbContextResolver().Model);
                }
                else if (Is<ChangeTracker>(serviceWithType.ServiceType))
                {
                    yield return CreateRegistration(service, serviceWithType.ServiceType, (c, p) => this.dbContextResolver().ChangeTracker);
                }
            }
        }

        private static bool IsDbSet(Type serviceType)
        {
            return serviceType.IsGenericType && serviceType.GetGenericTypeDefinition() == typeof(DbSet<>);
        }

        private static bool Is<T>(Type serviceType)
        {
            return typeof(T).IsAssignableFrom(serviceType);
        }

        private static Func<DbContext, object> DbSetResolver(Type entityType)
        {
            var param = Expression.Parameter(typeof(DbContext));
            var dbSetCall = Expression.Call(param, dbSetMethod.MakeGenericMethod(entityType));
            var lambda = Expression.Lambda<Func<DbContext, object>>(dbSetCall, param);

            return lambda.Compile();
        }
    }
}
