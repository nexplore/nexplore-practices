namespace Nexplore.Practices.Core.Domain.Model
{
    using System;
    using System.Linq.Expressions;

    public static class EntityExtensions
    {
        public static Expression<Func<T, bool>> CreateEqualsExpression<T, TId>(TId id)
            where T : class, IEntity<TId>
        {
            var parameterExpression = Expression.Parameter(typeof(T), "p");
            var idPropertyExpression = Expression.Property(parameterExpression, nameof(IEntity<TId>.Id));
            Expression<Func<TId>> idParameterClosure = () => id;

            var expressionBody = Expression.Equal(idPropertyExpression, idParameterClosure.Body);
            return Expression.Lambda<Func<T, bool>>(expressionBody, new[] { parameterExpression });
        }

        public static bool IsNew(this ITimestamped timestampedEntity)
        {
            Guard.ArgumentNotNull(timestampedEntity, nameof(timestampedEntity));

            return timestampedEntity.Timestamp == null || timestampedEntity.Timestamp.Length == 0;
        }
    }
}