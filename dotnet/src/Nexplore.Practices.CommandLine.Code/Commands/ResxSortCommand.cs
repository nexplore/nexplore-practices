namespace Nexplore.Practices.CommandLine.Code.Commands
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.CommandLine.Attributes;
    using Nexplore.Practices.CommandLine.Code;
    using Nexplore.Practices.CommandLine.Code.Models;
    using Nexplore.Practices.CommandLine.Code.Options;
    using Nexplore.Practices.CommandLine.Commands;

#pragma warning disable CA1010
    [HasParentCliCommand(typeof(CodeCommand))]
    [HasCliOption(typeof(FilePathOption))]
    [HasCliOption(typeof(DryRunOption))]
    public class ResxSortCommand : CliCommandBase<ResourceSorterOptionsValues, ResourceSorterOptionsValuesBinder>
    {
        private readonly Func<IResourceSorterService> resourceSorterService;

        public ResxSortCommand(Func<IResourceSorterService> resourceSorterService)
            : base("sort-resx", "Sorts the content of resource (*.resx) files")
        {
            this.resourceSorterService = resourceSorterService;
        }

        protected override Task<int> ExecuteAsync(CancellationToken cancellationToken)
        {
            var filePath = this.OptionsValuesModel.FilePath;

            if (this.OptionsValuesModel.DryRun)
            {
                this.resourceSorterService().Validate(filePath);
            }
            else
            {
                this.resourceSorterService().Sort(filePath);
            }

            return Task.FromResult(0);
        }
    }
}
#pragma warning restore CA1010
