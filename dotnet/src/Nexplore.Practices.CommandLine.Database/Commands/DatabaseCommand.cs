namespace Nexplore.Practices.CommandLine.Database.Commands
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.CommandLine.Commands;

#pragma warning disable CA1010
    public class DatabaseCommand : CliCommandBase
    {
        public DatabaseCommand()
            : base("database", "Groups commands for database manipulation")
        {
        }

        protected override Task<int> ExecuteAsync(CancellationToken cancellationToken)
        {
            throw new NotSupportedException($"The command '{this.Name}' can't be executed on its own. Show help (-h) for this command for further information.");
        }
    }
}
#pragma warning restore CA1010
