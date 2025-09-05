namespace Nexplore.Practices.Core.Extensions
{
    using System;
    using Nexplore.Practices.Core.Domain.Model;

    public static class EntityExtensions
    {
        public static Type GetUnproxiedType<T>(this IEntity<T> current)
        {
            var type = current.GetType();

            if (type.Namespace == "Castle.Proxies")
            {
                return type.BaseType;
            }

            return type;
        }
    }
}
