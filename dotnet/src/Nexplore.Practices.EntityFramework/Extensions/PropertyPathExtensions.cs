namespace Nexplore.Practices.EntityFramework.Extensions
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Linq.Expressions;

    public static class PropertyPathExtensions
    {
        private const char PROPERTY_PATH_SEPARATOR = '.';

        public static string ConcatPropertyPath(this string parentPath, string path)
        {
            return string.IsNullOrEmpty(parentPath) ? path : string.Join(PROPERTY_PATH_SEPARATOR, parentPath, path);
        }

        public static string PropertyPath<TValue>(this Expression<Func<TValue>> expression)
        {
            if (expression.Body is MemberExpression memberExpression)
            {
                return string.Join(PROPERTY_PATH_SEPARATOR, PropertyPathRecursive(memberExpression));
            }

            return null;
        }

        private static IEnumerable<string> PropertyPathRecursive(MemberExpression expression)
        {
            return expression is null ? Enumerable.Empty<string>() : PropertyPathRecursive(expression.Expression as MemberExpression).Append(expression.Member.Name);
        }
    }
}
