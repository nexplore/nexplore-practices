namespace Nexplore.Practices.Core.Domain.Model
{
    public interface ISoftDeleteEnabled
    {
        bool IsDeleted { get; set; }
    }
}
