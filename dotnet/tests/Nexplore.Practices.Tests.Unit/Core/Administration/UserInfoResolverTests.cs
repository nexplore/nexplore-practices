namespace Nexplore.Practices.Tests.Unit.Core.Administration
{
    using System;
    using Nexplore.Practices.Core.Administration;
    using NSubstitute;
    using NUnit.Framework;

    [TestFixture]
    public class UserInfoResolverTests
    {
        [Test]
        public void Resolve_WithDefaultAndNoFallback_CorrectlyResolveUsername()
        {
            // Arrange
            var user = Substitute.For<IUserInfo>();
            user.UserName.Returns("default");

            var resolver = new UserInfoResolver(user);

            // Act
            var username = resolver.Resolve<string, IUserInfo>(e => e.UserName);

            // Assert
            Assert.That(username, Is.EqualTo("default"));
        }

        [Test]
        public void Resolve_WithDefaultAndFallback_TakesFromDefault()
        {
            // Arrange
            var user = Substitute.For<IUserInfo>();
            user.UserName.Returns("default");

            var fallback = Substitute.For<IUserInfo>();
            fallback.UserName.Returns("fallback");

            var resolver = new UserInfoResolver(user, fallback);

            // Act
            var username = resolver.Resolve<string, IUserInfo>(e => e.UserName);

            // Assert
            Assert.That(username, Is.EqualTo("default"));
        }

        [Test]
        public void Resolve_WithNoDefaultAndFallback_TakesFromFallback()
        {
            // Arrange
            var user = Substitute.For<IUserInfo>();
            user.UserName.Returns(null as string);

            var fallback = Substitute.For<IUserInfo>();
            fallback.UserName.Returns("fallback");

            var resolver = new UserInfoResolver(user, fallback);

            // Act
            var username = resolver.Resolve<string, IUserInfo>(e => e.UserName);

            // Assert
            Assert.That(username, Is.EqualTo("fallback"));
        }

        [Test]
        public void Resolve_WithNoDefaultAndNoFallback_ReturnsNull()
        {
            // Arrange
            var user = Substitute.For<IUserInfo>();
            user.UserName.Returns(null as string);

            var resolver = new UserInfoResolver(user);

            // Act
            var username = resolver.Resolve<string, IUserInfo>(e => e.UserName);

            // Assert
            Assert.That(username, Is.EqualTo(null));
        }

        [Test]
        public void Impersonate_WithMultipleLevels_CorrectlyImpersonates()
        {
            // Arrange
            var defaultUserInfo = Substitute.For<IUserInfo>();
            defaultUserInfo.UserName.Returns("default");

            var firstLevelUserInfo = Substitute.For<IUserInfo>();
            firstLevelUserInfo.UserName.Returns("firstLevel");

            var secondLevelUserInfo = Substitute.For<IUserInfo>();
            secondLevelUserInfo.UserName.Returns("secondLevel");

            var userInfoResolver = new UserInfoResolver(defaultUserInfo);

            // Act
            string secondLevelUserName;
            string firstLevelUserName;

            using (userInfoResolver.Impersonate(firstLevelUserInfo))
            {
                using (userInfoResolver.Impersonate(secondLevelUserInfo))
                {
                    secondLevelUserName = userInfoResolver.Resolve<string, IUserInfo>(e => e.UserName);
                }

                firstLevelUserName = userInfoResolver.Resolve<string, IUserInfo>(e => e.UserName);
            }

            var defaultUserName = userInfoResolver.Resolve<string, IUserInfo>(e => e.UserName);

            // Assert
            Assert.That(secondLevelUserName, Is.EqualTo(secondLevelUserInfo.UserName));
            Assert.That(firstLevelUserName, Is.EqualTo(firstLevelUserInfo.UserName));
            Assert.That(defaultUserName, Is.EqualTo(defaultUserInfo.UserName));
        }

        [Test]
        public void Impersonate_WithNullUserInfo_ThrowsException()
        {
            // Arrange
            var defaultUserInfo = Substitute.For<IUserInfo>();
            var userResolver = new UserInfoResolver(defaultUserInfo);

            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => userResolver.Impersonate(null));
        }
    }
}