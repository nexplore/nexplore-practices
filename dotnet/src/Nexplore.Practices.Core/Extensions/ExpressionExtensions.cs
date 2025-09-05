namespace Nexplore.Practices.Core.Extensions
{
    using System;
    using System.Collections.Generic;
    using System.Linq.Expressions;

    public static class ExpressionExtensions
    {
        public static Expression ExtractBody(this LambdaExpression expression, params Expression[] parameters)
        {
            Guard.ArgumentNotNull(expression, nameof(expression));
            Guard.Assert(parameters.Length == expression.Parameters.Count, "parameters.Length == expression.Parameters.Count");

            var map = new Dictionary<ParameterExpression, Expression>(parameters.Length);
            for (var i = 0; i < parameters.Length; i++)
            {
                map.Add(expression.Parameters[i], parameters[i]);
            }

            return new ParameterRebinder(map).Visit(expression.Body);
        }

        public static string ExtractBodyProperties(this LambdaExpression expression)
        {
            Guard.ArgumentNotNull(expression, nameof(expression));

            return expression.Body.ExtractBodyProperties();
        }

        public static string ExtractBodyProperties(this Expression expression)
        {
            Guard.ArgumentNotNull(expression, nameof(expression));

            var properties = new List<string>();

            switch (expression.NodeType)
            {
                case ExpressionType.Call:
                    var methodCallExpression = expression as MethodCallExpression;
                    Guard.NotNull(methodCallExpression, nameof(methodCallExpression));

                    foreach (var arg in methodCallExpression.Arguments)
                    {
                        properties.Add(ExtractBodyProperties(arg));
                    }

                    break;
                case ExpressionType.Lambda:
                    var lambdaExpression = expression as LambdaExpression;
                    Guard.NotNull(lambdaExpression, nameof(lambdaExpression));

                    properties.Add(lambdaExpression.ExtractBodyProperties());

                    break;
                case ExpressionType.MemberAccess:
                    var memberName = expression.ToString();
                    properties.Add(memberName.Substring(memberName.IndexOf(".", StringComparison.InvariantCultureIgnoreCase) + 1));
                    break;
                default:
                    throw new NotSupportedException($"NodeType '{expression.NodeType}' is not supported");
            }

            return string.Join(".", properties);
        }

        private class ParameterRebinder : ExpressionVisitor
        {
            private readonly Dictionary<ParameterExpression, Expression> map;

            internal ParameterRebinder(Dictionary<ParameterExpression, Expression> map)
            {
                this.map = map;
            }

            protected override Expression VisitParameter(ParameterExpression p)
            {
                if (!this.map.TryGetValue(p, out var value))
                {
                    return base.VisitParameter(p);
                }

                if (value is ParameterExpression param)
                {
                    return base.VisitParameter(param);
                }

                return this.Visit(value);
            }
        }
    }
}
