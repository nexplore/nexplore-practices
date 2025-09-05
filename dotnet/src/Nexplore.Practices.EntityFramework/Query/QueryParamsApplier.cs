namespace Nexplore.Practices.EntityFramework.Query
{
    using System;
    using System.Collections.Concurrent;
    using System.Diagnostics.CodeAnalysis;
    using System.Linq;
    using System.Linq.Expressions;
    using System.Reflection;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;
    using Nexplore.Practices.Core.Query;
    using Nexplore.Practices.Core.Query.Objects;

    public abstract class QueryParamsApplier
    {
        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        protected static readonly MethodInfo QUERYABLE_ORDER_BY_METHOD = GetMethodInfo<IQueryable<bool>>(o => o.OrderBy(e => e));
        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        protected static readonly MethodInfo QUERYABLE_ORDER_BY_DESCENDING_METHOD = GetMethodInfo<IQueryable<bool>>(o => o.OrderByDescending(e => e));
        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        protected static readonly MethodInfo QUERYABLE_THEN_BY_METHOD = GetMethodInfo<IOrderedQueryable<bool>>(o => o.ThenBy(e => e));
        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        protected static readonly MethodInfo QUERYABLE_THEN_BY_DESCENDING_METHOD = GetMethodInfo<IOrderedQueryable<bool>>(o => o.ThenByDescending(e => e));
        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        protected static readonly char[] PROPERTY_SEPARATORS = { '/', '.' };

        private static MethodInfo GetMethodInfo<T>(Expression<Func<T, object>> expression)
        {
            Expression unpackedExpression = expression.Body;

            if (unpackedExpression is UnaryExpression unaryExpression)
            {
                unpackedExpression = unaryExpression.Operand;
            }

            var methodCallExpression = (MethodCallExpression)unpackedExpression;
            return methodCallExpression.Method.IsGenericMethod
                ? methodCallExpression.Method.GetGenericMethodDefinition()
                : methodCallExpression.Method;
        }
    }

    public abstract class QueryParamsApplier<TType> : QueryParamsApplier
    {
        private static readonly Type type = typeof(TType);
        private static readonly ConcurrentDictionary<string, MemberExpression> propertyExpressionCache = new ConcurrentDictionary<string, MemberExpression>();

        // This parameter expression needs to remain static as otherwise it would get garbage collected before the query happens
        private static readonly ParameterExpression parameterExpression = Expression.Parameter(type, "e");

        protected static IQueryable<TType> ApplyParameters(IQueryable<TType> query, QueryParams parameters)
        {
            if (parameters.Orderings != null && parameters.Orderings.Count != 0)
            {
                query = ApplyOrderings(query, parameters.Orderings.ToArray());
            }

            if (parameters.Skip.HasValue)
            {
                query = query.Skip(parameters.Skip.Value);
            }

            if (parameters.Take.HasValue)
            {
                query = query.Take(parameters.Take.Value);
            }

            return query;
        }

        private static IQueryable<TType> ApplyOrderings(IQueryable<TType> query, Ordering[] orderings)
        {
            for (var i = 0; i < orderings.Length; i++)
            {
                var propertyExpression = propertyExpressionCache.GetOrAdd(orderings[i].Field, CreatePropertyExpression);
                var lambda = Expression.Lambda(propertyExpression, parameterExpression);

                var orderMethodInfo = GetOrderingMethodInfo(i == 0, orderings[i].Direction);
                var genericOrderMethodInfo = orderMethodInfo.MakeGenericMethod(type, lambda.ReturnType);

                query = (IOrderedQueryable<TType>)genericOrderMethodInfo.Invoke(null, new object[] { query, lambda });
            }

            return query;
        }

        private static MemberExpression CreatePropertyExpression(string field)
        {
            MemberExpression propertyExpression = null;
            foreach (string property in field.Split(PROPERTY_SEPARATORS))
            {
                try
                {
                    propertyExpression = Expression.Property((Expression)propertyExpression ?? parameterExpression, property);
                }
                catch (ArgumentException)
                {
                    throw new InvalidOperationException($"The property '{field}' does not exist on '{type.FullName}'!");
                }
            }

            return propertyExpression;
        }

        private static MethodInfo GetOrderingMethodInfo(bool firstOrdering, OrderDirection orderDirection)
        {
            switch (orderDirection)
            {
                case OrderDirection.Asc:
                    return firstOrdering ? QUERYABLE_ORDER_BY_METHOD : QUERYABLE_THEN_BY_METHOD;
                case OrderDirection.Desc:
                    return firstOrdering ? QUERYABLE_ORDER_BY_DESCENDING_METHOD : QUERYABLE_THEN_BY_DESCENDING_METHOD;
                default:
                    throw new ArgumentOutOfRangeException(nameof(orderDirection));
            }
        }
    }

    public class AsyncQueryParamsApplier<TType> : QueryParamsApplier<TType>
    {
        private readonly IQueryable<TType> query;

        public AsyncQueryParamsApplier(IQueryable<TType> query)
        {
            this.query = query;
        }

        public async Task<ListResult<TType>> ApplyAsync(QueryParams parameters, CancellationToken cancellationToken)
        {
            var data = await this.GetDataAsync(parameters, cancellationToken).ConfigureAwait(false);
            var total = await this.GetTotalIfRequestedAsync(parameters, cancellationToken).ConfigureAwait(false);

            return new ListResult<TType>(data, total);
        }

        public async Task<ListResult<TDestination>> ApplyWithMapAsync<TDestination>(QueryParams parameters, Func<TType, TDestination> mapperFunc, CancellationToken cancellationToken)
        {
            var data = await this.GetDataAsync(parameters, cancellationToken).ConfigureAwait(false);
            var total = await this.GetTotalIfRequestedAsync(parameters, cancellationToken).ConfigureAwait(false);

            return new ListResult<TDestination>(data.Select(mapperFunc), total);
        }

        private async Task<TType[]> GetDataAsync(QueryParams parameters, CancellationToken cancellationToken)
        {
            var data = Array.Empty<TType>();
            if (!parameters.Take.HasValue || parameters.Take.Value > 0)
            {
                var queryWithAppliedParameters = ApplyParameters(this.query, parameters);
                data = await queryWithAppliedParameters.ToArrayAsync(cancellationToken).ConfigureAwait(false);
            }

            return data;
        }

        private async Task<long?> GetTotalIfRequestedAsync(QueryParams parameters, CancellationToken cancellationToken)
        {
            if (parameters.IncludeTotal)
            {
                return await this.query.LongCountAsync(cancellationToken).ConfigureAwait(false);
            }

            return null;
        }
    }

    public class SyncQueryParamsApplier<TType> : QueryParamsApplier<TType>
    {
        private readonly IQueryable<TType> query;

        public SyncQueryParamsApplier(IQueryable<TType> query)
        {
            this.query = query;
        }

        public ListResult<TType> Apply(QueryParams parameters)
        {
            var data = this.GetData(parameters);
            var total = this.GetTotalIfRequested(parameters);

            return new ListResult<TType>(data, total);
        }

        public ListResult<TDestination> ApplyWithMap<TDestination>(QueryParams parameters, Func<TType, TDestination> mapperFunc)
        {
            var data = this.GetData(parameters);
            var total = this.GetTotalIfRequested(parameters);

            return new ListResult<TDestination>(data.Select(mapperFunc), total);
        }

        private TType[] GetData(QueryParams parameters)
        {
            var data = Array.Empty<TType>();
            if (!parameters.Take.HasValue || parameters.Take.Value > 0)
            {
                var queryWithAppliedParameters = ApplyParameters(this.query, parameters);
                data = queryWithAppliedParameters.ToArray();
            }

            return data;
        }

        private long? GetTotalIfRequested(QueryParams parameters)
        {
            if (parameters.IncludeTotal)
            {
                return this.query.LongCount();
            }

            return null;
        }
    }
}
