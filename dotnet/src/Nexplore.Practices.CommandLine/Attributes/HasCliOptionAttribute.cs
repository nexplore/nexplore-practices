namespace Nexplore.Practices.CommandLine.Attributes
{
    using System;
    using Nexplore.Practices.Core;

    [AttributeUsage(validOn: AttributeTargets.Class, AllowMultiple = true)]
    public class HasCliOptionAttribute : Attribute
    {
        public HasCliOptionAttribute(Type cliOption)
        {
            Guard.ArgumentNotNull(cliOption, nameof(cliOption));

            this.CliOption = cliOption;
        }

        public Type CliOption { get; }
    }
}
