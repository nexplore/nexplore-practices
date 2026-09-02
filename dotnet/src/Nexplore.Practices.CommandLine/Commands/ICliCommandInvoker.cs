namespace Nexplore.Practices.CommandLine.Commands
{
    using System.Threading.Tasks;

    public interface ICliCommandInvoker
    {
        Task<int> InvokeAsync(string[] args);

        void RegisterCommand(ICliCommand command);
    }
}
