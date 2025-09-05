namespace Nexplore.Practices.Tests.Integration.Bootstrap.Validation
{
    using Nexplore.Practices.Core;

    public interface IValidationContext
    {
        IClock Clock { get; }
    }
}
