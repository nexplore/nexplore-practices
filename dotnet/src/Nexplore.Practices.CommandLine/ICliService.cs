namespace Nexplore.Practices.CommandLine
{
    using System.Threading.Tasks;

    public interface ICliService
    {
        Task<int> ExecuteAsync(string[] args);
    }
}
