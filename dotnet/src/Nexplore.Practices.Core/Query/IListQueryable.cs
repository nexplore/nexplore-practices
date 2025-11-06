namespace Nexplore.Practices.Core.Query
{
    using System.Linq.Expressions;

    public interface IListQueryable<TSource>
    {
        Expression Expression { get; }

        IListQueryableProvider<TSource> Provider { get; }
    }
}
