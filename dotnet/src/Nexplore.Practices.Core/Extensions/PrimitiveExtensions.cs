namespace Nexplore.Practices.Core.Extensions
{
    using System;
    using System.Collections.Generic;

    public static class PrimitiveExtensions
    {
        public static T ThrowIfDefault<T>(this T? value, Func<Exception> exceptionBuilder)
            where T : struct
        {
            if (EqualityComparer<T?>.Default.Equals(value, default) || !value.HasValue)
            {
                throw exceptionBuilder();
            }

            return value.Value;
        }

        public static T ThrowIfDefault<T>(this T value, Func<Exception> exceptionBuilder)
        {
            if (EqualityComparer<T>.Default.Equals(value, default))
            {
                throw exceptionBuilder();
            }

            return value;
        }
    }
}
