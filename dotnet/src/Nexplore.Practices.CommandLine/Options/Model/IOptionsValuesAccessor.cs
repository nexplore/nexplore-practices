namespace Nexplore.Practices.CommandLine.Options.Model
{
    using Nexplore.Practices.CommandLine.Options;

    public interface IOptionsValuesAccessor
    {
        T GetValueForCliOption<T>(CliOptionBase<T> cliOption);
    }
}
