namespace Nexplore.Practices.CommandLine
{
    using System.Threading.Tasks;
    using Nexplore.Practices.CommandLine.Commands;

    public class CliService : ICliService
    {
        private readonly ICliCommandInvoker cliCommandInvoker;

        public CliService(ICliCommandInvoker cliCommandInvoker)
        {
            this.cliCommandInvoker = cliCommandInvoker;
        }

        public async Task<int> ExecuteAsync(string[] args)
        {
            return await this.cliCommandInvoker.InvokeAsync(args).ConfigureAwait(false);
        }
    }
}
