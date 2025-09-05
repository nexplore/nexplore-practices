namespace Nexplore.Practices.Core.Query
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.Core.Query.Objects;

    public static class ListQueryableExtensions
    {
        public static Task<ListResult<TSource>> ToListResultAsync<TSource>(
            this IListQueryable<TSource> queryable,
            QueryParams parameters,
            CancellationToken cancellationToken = default)
        {
            return queryable.Provider.ToListResultAsync(queryable.Expression, parameters, cancellationToken);
        }

        public static Task<ListResult<TDestination>> ToListResultAsync<TSource, TDestination>(
            this IListQueryable<TSource> queryable,
            QueryParams parameters,
            Func<TSource, TDestination> mapperFunc,
            CancellationToken cancellationToken = default)
        {
            return queryable.Provider.ToListResultAsync(queryable.Expression, parameters, mapperFunc, cancellationToken);
        }

        public static IListQueryable<TDestination> ProjectTo<TSource, TDestination>(
            this IListQueryable<TSource> queryable,
            IQueryableProjector<TSource, TDestination> projector)
        {
            return queryable.Provider.ProjectTo(queryable.Expression, projector);
        }
    }
}
