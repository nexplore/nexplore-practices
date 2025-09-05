namespace Nexplore.Practices.Core.Domain.Model
{
    public interface IEntity<TId>
    {
        TId Id { get; set; }
    }
}
