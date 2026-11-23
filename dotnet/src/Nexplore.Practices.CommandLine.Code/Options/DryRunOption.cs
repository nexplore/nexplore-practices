namespace Nexplore.Practices.CommandLine.Code.Options
{
    using Nexplore.Practices.CommandLine.Options;

    public class DryRunOption : CliOptionBase<bool>
    {
        public DryRunOption()
            : base("--dry-run", "Whether to execute a dry-run test without making actual changes.", "-n")
        {
        }
    }
}
