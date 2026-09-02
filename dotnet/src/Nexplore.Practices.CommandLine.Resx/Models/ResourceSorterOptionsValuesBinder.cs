namespace Nexplore.Practices.CommandLine.Resx.Models
{
    using System.Collections.Generic;
    using Nexplore.Practices.CommandLine.Options;
    using Nexplore.Practices.CommandLine.Options.Model;
    using Nexplore.Practices.CommandLine.Resx.Options;

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
