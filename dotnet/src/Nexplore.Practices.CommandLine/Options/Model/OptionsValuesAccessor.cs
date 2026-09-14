namespace Nexplore.Practices.CommandLine.Options.Model
{
    using System.CommandLine;
    using Nexplore.Practices.CommandLine.Options;

    internal sealed class OptionsValuesAccessor : IOptionsValuesAccessor
    {
        private readonly ParseResult parseResult;

        public OptionsValuesAccessor(ParseResult parseResult)
        {
            this.parseResult = parseResult;
        }

        public T GetValueForCliOption<T>(CliOptionBase<T> cliOption)
        {
            return this.parseResult.CommandResult.GetValue(cliOption);
        }
    }
}
