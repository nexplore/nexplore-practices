namespace Nexplore.Practices.Tests.Integration.Core.Scopes
{
    using Autofac;
    using Nexplore.Practices.Core.Scopes;
    using NSubstitute;
    using NUnit.Framework;

    [TestFixture]
    public class AutofacChildScopeRegistrationSourceTests : ScopedTestsBase
    {
        [Test]
        public void ChildScopeRegistrationSource_WithNestedScopes_IsolatesInstanceToLifetimeScopes()
        {
            // Arrange
            var scope = Substitute.For<ILifetimeScope>();

            var scope1RegisteredInstance = new ChildScope(scope);
            var scope2RegisteredInstance = new ChildScope(scope);

            IChildScope scope1ResolvedInstance;
            IChildScope scope2ResolvedInstance;

            // Act
            using (var scope1 = this.Scope.BeginLifetimeScope(builder => builder.RegisterSource(new AutofacChildScopeRegistrationSource(() => scope1RegisteredInstance))))
            {
                scope1ResolvedInstance = scope1.Resolve<IChildScope>();

                using (var scope2 = scope1.BeginLifetimeScope(builder => builder.RegisterSource(new AutofacChildScopeRegistrationSource(() => scope2RegisteredInstance))))
                {
                    scope2ResolvedInstance = scope2.Resolve<IChildScope>();
                }
            }

            // Assert
            Assert.That(scope1ResolvedInstance, Is.SameAs(scope1RegisteredInstance));
            Assert.That(scope2ResolvedInstance, Is.SameAs(scope2RegisteredInstance));

            Assert.That(scope2ResolvedInstance, Is.Not.SameAs(scope1ResolvedInstance));
        }
    }
}
