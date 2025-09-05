namespace Nexplore.Practices.Core.Query
{
    using System;
    using System.Linq.Expressions;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.Core.Query.Objects;

    public interface IListQueryableProvider<TSource>
    {
        IListQueryable<TSource> CreateListQueryable(Expression expression);

        IListQueryable<TDestination> ProjectTo<TDestination>(
            Expression expression,
            IQueryableProjector<TSource, TDestination> projector);

        Task<ListResult<TSource>> ToListResultAsync(Expression expression, QueryParams parameters, CancellationToken cancellationToken = default);

        Task<ListResult<TDestination>> ToListResultAsync<TDestination>(Expression expression, QueryParams parameters, Func<TSource, TDestination> mapperFunc, CancellationToken cancellationToken = default);
    }
}
