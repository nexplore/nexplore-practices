namespace Nexplore.Practices.EntityFramework.Domain
{
    using System;
    using System.ComponentModel;
    using System.Linq;
    using System.Linq.Expressions;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;
    using Nexplore.Practices.Core.Domain;
    using Nexplore.Practices.Core.Exceptions;
    using Nexplore.Practices.EntityFramework.Query;

    public abstract class ReadRepositoryBase<TEntity> : IReadRepository<TEntity>
        where TEntity : class
    {
        private readonly DbSet<TEntity> set;

        protected ReadRepositoryBase(DbSet<TEntity> set)
        {
            this.set = set;
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual TEntity GetBySingle(Expression<Func<TEntity, bool>> predicate)
        {
            return this.GetBySingle(predicate, ignoreLocalCache: false);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual TEntity GetBySingle(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache)
        {
            return this.GetBySingle(predicate, ignoreLocalCache, Array.Empty<string>());
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual TEntity GetBySingle(Expression<Func<TEntity, bool>> predicate, params Expression<Func<TEntity, object>>[] includes)
        {
            return this.GetBySingle(predicate, ignoreLocalCache: false, includes);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual TEntity GetBySingle(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, params Expression<Func<TEntity, object>>[] includes)
        {
            if (!ignoreLocalCache)
            {
                var localEntity = this.set.Local.SingleOrDefault(predicate.Compile());
                if (localEntity != null)
                {
                    return localEntity;
                }
            }

            return this.GetQuery().ApplyIncludes(includes).Single(predicate, () => new EntityNotFoundException());
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual TEntity GetBySingle(Expression<Func<TEntity, bool>> predicate, params string[] includes)
        {
            return this.GetBySingle(predicate, ignoreLocalCache: false, includes);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual TEntity GetBySingle(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, params string[] includes)
        {
            if (!ignoreLocalCache)
            {
                var localEntity = this.set.Local.SingleOrDefault(predicate.Compile());
                if (localEntity != null)
                {
                    return localEntity;
                }
            }

            return this.GetQuery().ApplyIncludes(includes).Single(predicate, () => new EntityNotFoundException());
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual TEntity GetBySingleOrDefault(Expression<Func<TEntity, bool>> predicate)
        {
            return this.GetBySingleOrDefault(predicate, ignoreLocalCache: false);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual TEntity GetBySingleOrDefault(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache)
        {
            return this.GetBySingleOrDefault(predicate, ignoreLocalCache, Array.Empty<string>());
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual TEntity GetBySingleOrDefault(Expression<Func<TEntity, bool>> predicate, params Expression<Func<TEntity, object>>[] includes)
        {
            return this.GetBySingleOrDefault(predicate, ignoreLocalCache: false, includes);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual TEntity GetBySingleOrDefault(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, params Expression<Func<TEntity, object>>[] includes)
        {
            if (!ignoreLocalCache)
            {
                var localEntity = this.set.Local.SingleOrDefault(predicate.Compile());
                if (localEntity != null)
                {
                    return localEntity;
                }
            }

            return this.GetQuery().ApplyIncludes(includes).SingleOrDefault(predicate);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual TEntity GetBySingleOrDefault(Expression<Func<TEntity, bool>> predicate, params string[] includes)
        {
            return this.GetBySingleOrDefault(predicate, ignoreLocalCache: false, includes);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual TEntity GetBySingleOrDefault(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, params string[] includes)
        {
            if (!ignoreLocalCache)
            {
                var localEntity = this.set.Local.SingleOrDefault(predicate.Compile());
                if (localEntity != null)
                {
                    return localEntity;
                }
            }

            return this.GetQuery().ApplyIncludes(includes).SingleOrDefault(predicate);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken)
        {
            return this.GetBySingleAsync(predicate, ignoreLocalCache: false, cancellationToken);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, CancellationToken cancellationToken)
        {
            return this.GetBySingleAsync(predicate, ignoreLocalCache, cancellationToken, Array.Empty<string>());
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes)
        {
            return this.GetBySingleAsync(predicate, ignoreLocalCache: false, cancellationToken, includes);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes)
        {
            if (!ignoreLocalCache)
            {
                var localEntity = this.set.Local.SingleOrDefault(predicate.Compile());
                if (localEntity != null)
                {
                    return Task.FromResult(localEntity);
                }
            }

            return this.GetQuery().ApplyIncludes(includes).SingleAsync(predicate, () => new EntityNotFoundException(), cancellationToken);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken, params string[] includes)
        {
            return this.GetBySingleAsync(predicate, ignoreLocalCache: false, cancellationToken, includes);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual Task<TEntity> GetBySingleAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, CancellationToken cancellationToken, params string[] includes)
        {
            if (!ignoreLocalCache)
            {
                var localEntity = this.set.Local.SingleOrDefault(predicate.Compile());
                if (localEntity != null)
                {
                    return Task.FromResult(localEntity);
                }
            }

            return this.GetQuery().ApplyIncludes(includes).SingleAsync(predicate, () => new EntityNotFoundException(), cancellationToken);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken)
        {
            return this.GetBySingleOrDefaultAsync(predicate, ignoreLocalCache: false, cancellationToken);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, CancellationToken cancellationToken)
        {
            return this.GetBySingleOrDefaultAsync(predicate, ignoreLocalCache, cancellationToken, Array.Empty<string>());
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes)
        {
            return this.GetBySingleOrDefaultAsync(predicate, ignoreLocalCache: false, cancellationToken, includes);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, CancellationToken cancellationToken, params Expression<Func<TEntity, object>>[] includes)
        {
            if (!ignoreLocalCache)
            {
                var localEntity = this.set.Local.SingleOrDefault(predicate.Compile());
                if (localEntity != null)
                {
                    return Task.FromResult(localEntity);
                }
            }

            return this.GetQuery().ApplyIncludes(includes).SingleOrDefaultAsync(predicate, cancellationToken);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken, params string[] includes)
        {
            return this.GetBySingleOrDefaultAsync(predicate, ignoreLocalCache: false, cancellationToken, includes);
        }

        [EditorBrowsable(EditorBrowsableState.Advanced)]
        public virtual Task<TEntity> GetBySingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, bool ignoreLocalCache, CancellationToken cancellationToken, params string[] includes)
        {
            if (!ignoreLocalCache)
            {
                var localEntity = this.set.Local.SingleOrDefault(predicate.Compile());
                if (localEntity != null)
                {
                    return Task.FromResult(localEntity);
                }
            }

            return this.GetQuery().ApplyIncludes(includes).SingleOrDefaultAsync(predicate, cancellationToken);
        }

        protected DbSet<TEntity> GetSet()
        {
            return this.set;
        }

        protected virtual IQueryable<TEntity> GetQuery()
        {
            return this.set;
        }
    }
}
