namespace Nexplore.Practices.CommandLine.Commands
{
    using System.Collections.Generic;
    using System.CommandLine;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.CommandLine.Options;
    using Nexplore.Practices.CommandLine.Options.Model;

#pragma warning disable CA1010
#pragma warning disable CA2007
    public abstract class CliCommandBase : Command, ICliCommand
    {
        protected CliCommandBase(string name, string description = null) : base(name, description)
        {
            this.SetAction(async (parseResult, cancellationToken) =>
            {
                this.OnBeforeExecute(parseResult);
                var exitCode = await this.ExecuteAsync(cancellationToken).ConfigureAwait(false);

                return exitCode;
            });
        }

        private protected virtual void OnBeforeExecute(ParseResult parseResult)
        {
        }

        protected abstract Task<int> ExecuteAsync(CancellationToken cancellationToken);

        public void RegisterCliSubCommand(ICliCommand cliCommand)
        {
            if (cliCommand is Command command)
            {
                this.Subcommands.Add(command);
            }
        }

        public void RegisterCliOptions(IEnumerable<ICliOption> cliOptions)
        {
            foreach (var cliOption in cliOptions)
            {
                this.RegisterCliOption(cliOption);
            }
        }

        private void RegisterCliOption(ICliOption cliOption)
        {
            if (cliOption is Option option)
            {
                this.Options.Add(option);
            }
        }
    }

    public abstract class CliCommandBase<TModel, TModelBinder>(string name, string description = null)
        : CliCommandBase(name, description)
        where TModel : new()
        where TModelBinder : ModelBinderBase<TModel>, new()
    {
        protected TModel OptionsValuesModel { get; private set; }

        private protected override void OnBeforeExecute(ParseResult parseResult)
        {
            var binder = new TModelBinder();
            this.OptionsValuesModel = binder.GetModel(this.Options.Cast<ICliOption>(), new OptionsValuesAccessor(parseResult));
        }
    }
}
#pragma warning restore CA1010
#pragma warning restore CA2007
