namespace Nexplore.Practices.EntityFramework.Query
{
    using System;
    using System.Diagnostics.CodeAnalysis;
    using System.Linq;
    using System.Linq.Expressions;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;
    using Nexplore.Practices.Core.Extensions;
    using Nexplore.Practices.Core.Query;

    [SuppressMessage("Microsoft.Naming", "CA1720:IdentifiersShouldNotContainTypeNames", Justification = "The function 'Single' on enumerables is well-established.")]
    public static class QueryableExtensions
    {
        public static IListQueryable<TType> AsListQueryable<TType>(this IQueryable<TType> query)
        {
            var provider = new ListQueryableProvider<TType>(query.Provider);
            return new ListQueryable<TType>(query.Expression, provider);
        }

        public static IListQueryable<TType> AsSyncListQueryable<TType>(this IQueryable<TType> query)
        {
            var provider = new SyncListQueryableProvider<TType>(query.Provider);
            return new ListQueryable<TType>(query.Expression, provider);
        }

        public static TEntity Single<TEntity>(this IQueryable<TEntity> source, Func<Exception> nothingFoundExceptionBuilder)
        {
            return source.SingleOrDefault().ThrowIfDefault(nothingFoundExceptionBuilder);
        }

        public static TEntity Single<TEntity>(this IQueryable<TEntity> source, Expression<Func<TEntity, bool>> predicate, Func<Exception> nothingFoundExceptionBuilder)
        {
            return source.SingleOrDefault(predicate).ThrowIfDefault(nothingFoundExceptionBuilder);
        }

        public static async Task<TEntity> SingleAsync<TEntity>(this IQueryable<TEntity> source, Func<Exception> nothingFoundExceptionBuilder, CancellationToken cancellationToken = default)
        {
            return (await source.SingleOrDefaultAsync(cancellationToken).ConfigureAwait(false)).ThrowIfDefault(nothingFoundExceptionBuilder);
        }

        public static async Task<TEntity> SingleAsync<TEntity>(this IQueryable<TEntity> source, Expression<Func<TEntity, bool>> predicate, Func<Exception> nothingFoundExceptionBuilder, CancellationToken cancellationToken = default)
        {
            return (await source.SingleOrDefaultAsync(predicate, cancellationToken).ConfigureAwait(false)).ThrowIfDefault(nothingFoundExceptionBuilder);
        }

        public static IQueryable<TEntity> ApplyIncludes<TEntity>(this IQueryable<TEntity> source, params Expression<Func<TEntity, object>>[] includes)
            where TEntity : class
        {
            return includes.Aggregate(source, (acc, i) => acc.Include(i.ExtractBodyProperties()));
        }

        public static IQueryable<TEntity> ApplyIncludes<TEntity>(this IQueryable<TEntity> source, params string[] includes)
            where TEntity : class
        {
            return includes.Aggregate(source, (acc, i) => acc.Include(i));
        }
    }
}
