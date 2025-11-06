namespace Nexplore.Practices.EntityFramework.Query
{
    using System;
    using System.Linq;
    using System.Linq.Expressions;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.Core.Query;
    using Nexplore.Practices.Core.Query.Objects;

    public class SyncListQueryableProvider<TType> : IListQueryableProvider<TType>
    {
        private readonly IQueryProvider underlyingProvider;

        public SyncListQueryableProvider(IQueryProvider underlyingProvider)
        {
            this.underlyingProvider = underlyingProvider;
        }

        public virtual IListQueryable<TType> CreateListQueryable(Expression expression)
        {
            var query = this.BuildQuery(expression);
            return new ListQueryable<TType>(query.Expression, this);
        }

        public virtual IListQueryable<TDestination> ProjectTo<TDestination>(Expression expression, IQueryableProjector<TType, TDestination> projector)
        {
            var projectedQuery = projector.ProjectTo(this.BuildQuery(expression));
            var projectedListProvider = new SyncListQueryableProvider<TDestination>(projectedQuery.Provider);
            return new ListQueryable<TDestination>(projectedQuery.Expression, projectedListProvider);
        }

        public virtual Task<ListResult<TType>> ToListResultAsync(Expression expression, QueryParams parameters, CancellationToken cancellationToken)
        {
            var result = new SyncQueryParamsApplier<TType>(this.BuildQuery(expression)).Apply(parameters);
            return Task.FromResult(result);
        }

        public virtual Task<ListResult<TDestination>> ToListResultAsync<TDestination>(Expression expression, QueryParams parameters, Func<TType, TDestination> mapperFunc, CancellationToken cancellationToken)
        {
            var result = new SyncQueryParamsApplier<TType>(this.BuildQuery(expression)).ApplyWithMap(parameters, mapperFunc);
            return Task.FromResult(result);
        }

        private IQueryable<TType> BuildQuery(Expression expression)
        {
            return this.underlyingProvider.CreateQuery<TType>(expression);
        }
    }
}
