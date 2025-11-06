namespace Nexplore.Practices.Core.Query
{
    using Nexplore.Practices.Core.Query.Objects;

    public interface IQueryParamsTransformer
    {
        QueryParams Transform();
    }
}
