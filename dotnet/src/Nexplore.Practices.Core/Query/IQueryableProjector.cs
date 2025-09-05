namespace Nexplore.Practices.Core.Query
{
    using System.Linq;

    public interface IQueryableProjector<in TSource, out TDestination>
    {
        IQueryable<TDestination> ProjectTo(IQueryable<TSource> source);
    }
}
