namespace Nexplore.Practices.Tests.Integration.Bootstrap.Validation
{
    using Nexplore.Practices.Core;

    public class ValidationContext : IValidationContext
    {
        public ValidationContext(IClock clock)
        {
            this.Clock = clock;
        }

        public IClock Clock { get; }
    }
}
