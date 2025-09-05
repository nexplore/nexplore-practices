namespace Nexplore.Practices.Tests.Integration.Web
{
    using Autofac;
    using Microsoft.Extensions.Localization;
    using Nexplore.Practices.Web.Localization;
    using NUnit.Framework;

    [TestFixture]
    public class RegistryTests : ScopedTestsBase
    {
        [Test]
        public void Resolve_StringLocalizerFactory_CorrectlyResolves()
        {
            // Act
            var factory = this.Scope.Resolve<IStringLocalizerFactory>();

            // Assert
            Assert.That(factory, Is.TypeOf<PracticesStringLocalizerFactory>());
        }

        [Test]
        public void Resolve_StringLocalizerWithFallback_CorrectlyResolves()
        {
            // Act
            var factory = this.Scope.Resolve<IStringLocalizer<SourceResource, FallbackResource>>();

            // Assert
            Assert.That(factory, Is.TypeOf<StringLocalizerWithFallback<SourceResource, FallbackResource>>());
            Assert.That(factory, Is.AssignableTo<IStringLocalizer>());
        }

        private sealed class SourceResource
        {
        }

        private sealed class FallbackResource
        {
        }
    }
}
