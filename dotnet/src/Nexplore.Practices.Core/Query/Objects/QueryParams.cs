namespace Nexplore.Practices.Core.Query.Objects
{
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.Linq;
    using Nexplore.Practices.Core.Query;

    /// <summary>
    /// Holds parameters for applying to <see cref="Nexplore.Practices.Core.Query.IListQueryable{TSource}"/> to retrieve a <see cref="ListResult{TData}"/>.
    /// </summary>
    public class QueryParams
    {
        public int? Skip { get; set; }

        public int? Take { get; set; }

        public ICollection<Ordering> Orderings { get; set; } = new Collection<Ordering>();

        public bool IncludeTotal { get; set; }

        public virtual QueryParams Clone()
        {
            return new QueryParams
            {
                Skip = this.Skip,
                Take = this.Take,
                IncludeTotal = this.IncludeTotal,
                Orderings = this.Orderings.Select(o => o.Clone()).ToList(),
            };
        }
    }
}