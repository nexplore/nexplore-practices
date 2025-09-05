namespace Nexplore.Practices.Tests.Integration.Core.Administration
{
    using Autofac;
    using Nexplore.Practices.Core.Administration;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Administration;
    using NSubstitute;
    using NUnit.Framework;

    [TestFixture]
    public class UserInfoResolverTests : ScopedTestsBase
    {
        [Test]
        public void Impersonate_WithNestedChildScope_RetainsImpersonatedUser()
        {
            // Arrange
            var impersonatedUserInfo = Substitute.For<IUserInfo>();
            impersonatedUserInfo.UserName.Returns("impersonated");
            string impersonatedUserName;
            string nestedUserName;

            // Act
            IUserInfoResolver topLevelUserInfoResolver = this.Scope.Resolve<IUserInfoResolver>();
            var initialUserName = topLevelUserInfoResolver.Resolve<string, IUserInfo>(u => u.UserName);
            using (topLevelUserInfoResolver.Impersonate(impersonatedUserInfo))
            {
                impersonatedUserName = topLevelUserInfoResolver.Resolve<string, IUserInfo>(u => u.UserName);
                IChildScopeFactory<IUserInfoResolver> childScopeFactory = this.Scope.Resolve<IChildScopeFactory<IUserInfoResolver>>();
                using (IChildScope<IUserInfoResolver> nestedScope = childScopeFactory.Begin())
                {
                    nestedUserName = nestedScope.Dependent.Resolve<string, IUserInfo>(u => u.UserName);
                }
            }

            var finalUserName = topLevelUserInfoResolver.Resolve<string, IUserInfo>(u => u.UserName);

            // Assert
            Assert.That(initialUserName, Is.EqualTo(new TestUserInfo().UserName));
            Assert.That(impersonatedUserName, Is.EqualTo(impersonatedUserInfo.UserName));
            Assert.That(nestedUserName, Is.EqualTo(impersonatedUserInfo.UserName));
            Assert.That(finalUserName, Is.EqualTo(initialUserName));
        }

        [Test]
        public void Impersonate_WithNestedUnitOfWork_RetainsImpersonatedUser()
        {
            // Arrange
            var impersonatedUserInfo = Substitute.For<IUserInfo>();
            impersonatedUserInfo.UserName.Returns("impersonated");
            string impersonatedUserName;
            string nestedUserName;

            // Act
            IUserInfoResolver topLevelUserInfoResolver = this.Scope.Resolve<IUserInfoResolver>();
            var initialUserName = topLevelUserInfoResolver.Resolve<string, IUserInfo>(u => u.UserName);
            using (topLevelUserInfoResolver.Impersonate(impersonatedUserInfo))
            {
                impersonatedUserName = topLevelUserInfoResolver.Resolve<string, IUserInfo>(u => u.UserName);
                IUnitOfWorkFactory<IUserInfoResolver> unitOfWorkFactory = this.Scope.Resolve<IUnitOfWorkFactory<IUserInfoResolver>>();
                using (IUnitOfWork<IUserInfoResolver> nestedUnitOfWork = unitOfWorkFactory.Begin())
                {
                    nestedUserName = nestedUnitOfWork.Dependent.Resolve<string, IUserInfo>(u => u.UserName);
                }
            }

            var finalUserName = topLevelUserInfoResolver.Resolve<string, IUserInfo>(u => u.UserName);

            // Assert
            Assert.That(initialUserName, Is.EqualTo(new TestUserInfo().UserName));
            Assert.That(impersonatedUserName, Is.EqualTo(impersonatedUserInfo.UserName));
            Assert.That(nestedUserName, Is.EqualTo(impersonatedUserInfo.UserName));
            Assert.That(finalUserName, Is.EqualTo(initialUserName));
        }
    }
}
