namespace Nexplore.Practices.Core.Domain
{
    using System;
    using System.Linq.Expressions;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.Core.Domain.Model;

    public static class ReadRepositoryExtensions
    {
        public static TEntity GetById<TEntity, TId>(this IReadRepository<TEntity> @this, TId id)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetById(id, ignoreLocalCache: false);
        }

        public static TEntity GetById<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetById(id, ignoreLocalCache, Array.Empty<string>());
        }

        public static TEntity GetById<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, params Expression<Func<TEntity, object>>[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetById(id, ignoreLocalCache: false, includes);
        }

        public static TEntity GetById<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache, params Expression<Func<TEntity, object>>[] includes)
            where TEntity : class, IEntity<TId>
        {
            var expression = EntityExtensions.CreateEqualsExpression<TEntity, TId>(id);
            return @this.GetBySingle(expression, ignoreLocalCache, includes);
        }

        public static TEntity GetById<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, params string[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetById(id, ignoreLocalCache: false, includes);
        }

        public static TEntity GetById<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache, params string[] includes)
            where TEntity : class, IEntity<TId>
        {
            var expression = EntityExtensions.CreateEqualsExpression<TEntity, TId>(id);
            return @this.GetBySingle(expression, ignoreLocalCache, includes);
        }

        public static Task<TEntity> GetByIdAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, CancellationToken cancellationToken = default)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdAsync(id, ignoreLocalCache: false, cancellationToken: cancellationToken);
        }

        public static Task<TEntity> GetByIdAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache, CancellationToken cancellationToken = default)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdAsync(id, ignoreLocalCache, cancellationToken, Array.Empty<string>());
        }

        public static Task<TEntity> GetByIdAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, params Expression<Func<TEntity, object>>[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdAsync(id, CancellationToken.None, includes);
        }

        public static Task<TEntity> GetByIdAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdAsync(id, ignoreLocalCache: false, cancellationToken, includes);
        }

        public static Task<TEntity> GetByIdAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache, params Expression<Func<TEntity, object>>[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdAsync(id, ignoreLocalCache, CancellationToken.None, includes);
        }

        public static Task<TEntity> GetByIdAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes)
            where TEntity : class, IEntity<TId>
        {
            var expression = EntityExtensions.CreateEqualsExpression<TEntity, TId>(id);
            return @this.GetBySingleAsync(expression, ignoreLocalCache, cancellationToken, includes);
        }

        public static Task<TEntity> GetByIdAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, params string[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdAsync(id, CancellationToken.None, includes);
        }

        public static Task<TEntity> GetByIdAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, CancellationToken cancellationToken, params string[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdAsync(id, ignoreLocalCache: false, cancellationToken, includes);
        }

        public static Task<TEntity> GetByIdAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache, params string[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdAsync(id, ignoreLocalCache, CancellationToken.None, includes);
        }

        public static Task<TEntity> GetByIdAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache, CancellationToken cancellationToken, params string[] includes)
            where TEntity : class, IEntity<TId>
        {
            var expression = EntityExtensions.CreateEqualsExpression<TEntity, TId>(id);
            return @this.GetBySingleAsync(expression, ignoreLocalCache, cancellationToken, includes);
        }

        public static TEntity GetByIdOrDefault<TEntity, TId>(this IReadRepository<TEntity> @this, TId id)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdOrDefault(id, ignoreLocalCache: false);
        }

        public static TEntity GetByIdOrDefault<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdOrDefault(id, ignoreLocalCache, Array.Empty<string>());
        }

        public static TEntity GetByIdOrDefault<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, params Expression<Func<TEntity, object>>[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdOrDefault(id, ignoreLocalCache: false, includes);
        }

        public static TEntity GetByIdOrDefault<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache, params Expression<Func<TEntity, object>>[] includes)
            where TEntity : class, IEntity<TId>
        {
            var expression = EntityExtensions.CreateEqualsExpression<TEntity, TId>(id);
            return @this.GetBySingleOrDefault(expression, ignoreLocalCache, includes);
        }

        public static TEntity GetByIdOrDefault<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, params string[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdOrDefault(id, ignoreLocalCache: false, includes);
        }

        public static TEntity GetByIdOrDefault<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache, params string[] includes)
            where TEntity : class, IEntity<TId>
        {
            var expression = EntityExtensions.CreateEqualsExpression<TEntity, TId>(id);
            return @this.GetBySingleOrDefault(expression, ignoreLocalCache, includes);
        }

        public static Task<TEntity> GetByIdOrDefaultAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, CancellationToken cancellationToken = default)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdOrDefaultAsync(id, ignoreLocalCache: false, cancellationToken);
        }

        public static Task<TEntity> GetByIdOrDefaultAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache, CancellationToken cancellationToken = default)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdOrDefaultAsync(id, ignoreLocalCache, cancellationToken, Array.Empty<string>());
        }

        public static Task<TEntity> GetByIdOrDefaultAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, params Expression<Func<TEntity, object>>[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdOrDefaultAsync(id, CancellationToken.None, includes);
        }

        public static Task<TEntity> GetByIdOrDefaultAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdOrDefaultAsync(id, ignoreLocalCache: false, cancellationToken, includes);
        }

        public static Task<TEntity> GetByIdOrDefaultAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache, params Expression<Func<TEntity, object>>[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdOrDefaultAsync(id, ignoreLocalCache, CancellationToken.None, includes);
        }

        public static Task<TEntity> GetByIdOrDefaultAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes)
            where TEntity : class, IEntity<TId>
        {
            var expression = EntityExtensions.CreateEqualsExpression<TEntity, TId>(id);
            return @this.GetBySingleOrDefaultAsync(expression, ignoreLocalCache, cancellationToken, includes);
        }

        public static Task<TEntity> GetByIdOrDefaultAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, params string[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdOrDefaultAsync(id, CancellationToken.None, includes);
        }

        public static Task<TEntity> GetByIdOrDefaultAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, CancellationToken cancellationToken, params string[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdOrDefaultAsync(id, ignoreLocalCache: false, cancellationToken, includes);
        }

        public static Task<TEntity> GetByIdOrDefaultAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache, params string[] includes)
            where TEntity : class, IEntity<TId>
        {
            return @this.GetByIdOrDefaultAsync(id, ignoreLocalCache, CancellationToken.None, includes);
        }

        public static Task<TEntity> GetByIdOrDefaultAsync<TEntity, TId>(this IReadRepository<TEntity> @this, TId id, bool ignoreLocalCache, CancellationToken cancellationToken, params string[] includes)
            where TEntity : class, IEntity<TId>
        {
            var expression = EntityExtensions.CreateEqualsExpression<TEntity, TId>(id);
            return @this.GetBySingleOrDefaultAsync(expression, ignoreLocalCache, cancellationToken, includes);
        }
    }
}