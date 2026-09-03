namespace Nexplore.Practices.CommandLine.Code.Models
{
    using System.Collections.Generic;
    using Nexplore.Practices.CommandLine.Code.Options;
    using Nexplore.Practices.CommandLine.Options;
    using Nexplore.Practices.CommandLine.Options.Model;

    public class ResourceSorterOptionsValuesBinder : ModelBinderBase<ResourceSorterOptionsValues>
    {
        public override ResourceSorterOptionsValues GetModel(IEnumerable<ICliOption> options, IOptionsValuesAccessor optionsValuesAccessor)
        {
            return new ResourceSorterOptionsValues
            {
                FilePath = optionsValuesAccessor.GetValueForCliOption(this.GetFirstOptionOrThrow<FilePathOption>(options)),
                DryRun = optionsValuesAccessor.GetValueForCliOption(this.GetFirstOptionOrThrow<DryRunOption>(options)),
            };
        }
    }
}
