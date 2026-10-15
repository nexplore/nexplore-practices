namespace Nexplore.Practices.CommandLine.Options.Model
{
    using System.Collections.Generic;
    using System.Linq;
    using Nexplore.Practices.CommandLine.Exceptions;
    using Nexplore.Practices.CommandLine.Options;

    public abstract class ModelBinderBase<TModel> where TModel : new()
    {
        public abstract TModel GetModel(IEnumerable<ICliOption> options, IOptionsValuesAccessor optionsValuesAccessor);

        protected TOption GetFirstOptionOrThrow<TOption>(IEnumerable<ICliOption> options)
            where TOption : ICliOption
        {
            return options.OfType<TOption>().FirstOrDefault() ?? throw new CliConfigurationException($"The requested option of type {typeof(TOption).Name} is not registered for the current command.");
        }
    }
}
