namespace Nexplore.Practices.Core.Query.Objects
{
    public class Ordering
    {
        public string Field { get; set; }

        public OrderDirection Direction { get; set; }

        public Ordering Clone()
        {
            return new Ordering { Field = this.Field, Direction = this.Direction };
        }
    }
}