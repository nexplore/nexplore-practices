namespace Nexplore.Practices.Core.Query
{
    using System.Linq.Expressions;

    public class ListQueryable<TSource> : IListQueryable<TSource>
    {
        public ListQueryable(Expression expression, IListQueryableProvider<TSource> provider)
        {
            this.Expression = expression;
            this.Provider = provider;
        }

        public Expression Expression { get; }

        public IListQueryableProvider<TSource> Provider { get; }
    }
}
