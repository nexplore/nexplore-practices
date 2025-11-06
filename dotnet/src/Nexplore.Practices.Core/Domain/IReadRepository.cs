namespace Nexplore.Practices.Core.Domain
{
    using System;
    using System.ComponentModel;
    using System.Linq.Expressions;
    using System.Threading;
    using System.Threading.Tasks;

    public interface IReadRepository<TEntity>
        where TEntity : class
    {
        [EditorBrowsable(EditorBrowsableState.Advanced)]
        TEntity GetBySingle(Expression<Func<TEntity, bool>> predicate);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        TEntity GetBySingle(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        TEntity GetBySingle(Expression<Func<TEntity, bool>> predicate, params Expression<Func<TEntity, object>>[] includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        TEntity GetBySingle(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, params Expression<Func<TEntity, object>>[] includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        TEntity GetBySingle(Expression<Func<TEntity, bool>> predicate, params string[] includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        TEntity GetBySingle(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, params string[] includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        TEntity GetBySingleOrDefault(Expression<Func<TEntity, bool>> predicate);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        TEntity GetBySingleOrDefault(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        TEntity GetBySingleOrDefault(Expression<Func<TEntity, bool>> predicate, params Expression<Func<TEntity, object>>[] includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        TEntity GetBySingleOrDefault(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, params Expression<Func<TEntity, object>>[] includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        TEntity GetBySingleOrDefault(Expression<Func<TEntity, bool>> predicate, params string[] includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        TEntity GetBySingleOrDefault(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, params string[] includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, CancellationToken cancellationToken = default);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, params Expression<Func<TEntity, object>>[] includes)
            => this.GetBySingleAsync(predicate, CancellationToken.None, includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, params Expression<Func<TEntity, object>>[] includes)
            => this.GetBySingleAsync(predicate, ignoreLocalCache, CancellationToken.None, includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, params string[] includes)
            => this.GetBySingleAsync(predicate, CancellationToken.None, includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken, params string[] includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, params string[] includes)
            => this.GetBySingleAsync(predicate, ignoreLocalCache, CancellationToken.None, includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, CancellationToken cancellationToken, params string[] includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, CancellationToken cancellationToken = default);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, params Expression<Func<TEntity, object>>[] includes)
            => this.GetBySingleOrDefaultAsync(predicate, CancellationToken.None, includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, params Expression<Func<TEntity, object>>[] includes)
            => this.GetBySingleOrDefaultAsync(predicate, ignoreLocalCache, CancellationToken.None, includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, params string[] includes)
            => this.GetBySingleOrDefaultAsync(predicate, CancellationToken.None, includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken, params string[] includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, params string[] includes)
            => this.GetBySingleOrDefaultAsync(predicate, ignoreLocalCache, CancellationToken.None, includes);

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, CancellationToken cancellationToken, params string[] includes);
    }
}
