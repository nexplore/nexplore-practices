namespace Nexplore.Practices.CommandLine.Commands
{
    using System.CommandLine;
    using System.Threading.Tasks;

#pragma warning disable CA1010
#pragma warning disable CA1710
#pragma warning disable CA2007
    public class CliCommandInvoker : RootCommand, ICliCommandInvoker
    {
        public CliCommandInvoker()
            : base("CLI for ALSA to execute development and deployment tasks")
        {
        }

        public async Task<int> InvokeAsync(string[] args)
        {
            return await this.Parse(args).InvokeAsync().ConfigureAwait(false);
        }

        public void RegisterCommand(ICliCommand command)
        {
            this.Subcommands.Add((Command)command);
        }
    }
}
#pragma warning restore CA1010
#pragma warning restore CA1710
#pragma warning restore CA2007
