namespace Nexplore.Practices.CommandLine.Options
{
    using System.CommandLine;

    public abstract class CliOptionBase<T> : Option<T>, ICliOption
    {
        protected CliOptionBase(string name, string description = null, params string[] aliases) : base(name, aliases)
        {
            this.Description = description;
        }
    }
}
