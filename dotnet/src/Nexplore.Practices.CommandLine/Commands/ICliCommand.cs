namespace Nexplore.Practices.CommandLine.Commands
{
    using System.Collections.Generic;
    using Nexplore.Practices.CommandLine.Options;

    public interface ICliCommand
    {
        string Name { get; }

        void RegisterCliSubCommand(ICliCommand cliCommand);

        void RegisterCliOptions(IEnumerable<ICliOption> cliOptions);
    }
}
