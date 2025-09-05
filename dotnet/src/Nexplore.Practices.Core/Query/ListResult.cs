namespace Nexplore.Practices.Core.Query
{
    using System.Collections.Generic;

    public class ListResult<TData>
    {
        public ListResult(IEnumerable<TData> data, long? total = null)
        {
            this.Data = data;
            this.Total = total;
        }

        public IEnumerable<TData> Data { get; }

        public long? Total { get; }
    }
}
