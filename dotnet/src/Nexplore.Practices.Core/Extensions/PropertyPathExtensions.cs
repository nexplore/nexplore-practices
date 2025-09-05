namespace Nexplore.Practices.Core.Extensions
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Linq.Expressions;
    using System.Reflection;

    public static class PropertyPathExtensions
    {
        private const char PROPERTY_PATH_SEPARATOR = '.';

        public static string ConcatPropertyPath(this string parentPath, string path)
        {
            return string.IsNullOrEmpty(parentPath) ? path : string.Join(PROPERTY_PATH_SEPARATOR, parentPath, path);
        }

        public static string PropertyPath<TValue>(this Expression<Func<TValue>> expression)
        {
            var memberExpression = ExtractMemberExpressionOrDefault(expression);
            if (memberExpression != null)
            {
                return string.Join(PROPERTY_PATH_SEPARATOR, PropertyPathRecursive(memberExpression));
            }

            return null;
        }

        private static MemberExpression ExtractMemberExpressionOrDefault<TValue>(Expression<Func<TValue>> expression)
        {
            if (expression.Body.NodeType == ExpressionType.Convert && expression.Body is UnaryExpression unaryExpression)
            {
                return unaryExpression.Operand as MemberExpression;
            }

            if (expression.Body is MemberExpression memberExpression)
            {
                return memberExpression;
            }

            return null;
        }

        private static IEnumerable<string> PropertyPathRecursive(MemberExpression expression)
        {
            if (expression?.Expression is null || expression.Member is not PropertyInfo propertyInfo)
            {
                return Enumerable.Empty<string>();
            }

            return PropertyPathRecursive(expression.Expression as MemberExpression).Append(propertyInfo.Name);
        }
    }
}
