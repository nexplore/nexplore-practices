namespace Nexplore.Practices.CommandLine.Resx.Commands
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.CommandLine.Commands;

#pragma warning disable CA1010
    public class CodeCommand : CliCommandBase
    {
        public CodeCommand()
            : base("code", "Groups commands for code generation/manipulation")
        {
        }

        protected override Task<int> ExecuteAsync(CancellationToken cancellationToken)
        {
            throw new NotSupportedException($"The command '{this.Name}' can't be executed on its own. Show help (-h) for this command for further information.");
        }
    }
}
#pragma warning restore CA1010
