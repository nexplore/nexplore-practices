namespace Nexplore.Practices.CommandLine.Attributes
{
    using System;
    using Nexplore.Practices.Core;

    [AttributeUsage(validOn: AttributeTargets.Class)]
    public class HasParentCliCommandAttribute : Attribute
    {
        public HasParentCliCommandAttribute(Type parentCliCommand)
        {
            Guard.ArgumentNotNull(parentCliCommand, nameof(parentCliCommand));

            this.ParentCliCommand = parentCliCommand;
        }

        public Type ParentCliCommand { get; }
    }
}
