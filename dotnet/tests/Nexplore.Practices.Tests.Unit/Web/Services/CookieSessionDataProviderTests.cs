namespace Nexplore.Practices.Tests.Unit.Web.Services
{
    using Microsoft.AspNetCore.DataProtection;
    using Microsoft.Extensions.Logging.Abstractions;
    using Nexplore.Practices.Core.Services;
    using Nexplore.Practices.Web.Services;
    using NSubstitute;
    using NUnit.Framework;

    [TestFixture]
    public class CookieSessionDataProviderTests
    {
        [Test]
        public void SaveAndLoad_WithBooleanValue_CorrectlyStoresAndLoadsValue()
        {
            // Arrange
            string cookieValue = null;
            var key = "my-key";

            var cookieService = Substitute.For<ICookieService>();
            cookieService.When(x => x.IssueCookie(Arg.Any<string>(), Arg.Any<string>())).Do(x => cookieValue = x.ArgAt<string>(1));
            cookieService.GetCookieValue(Arg.Any<string>()).Returns(x => cookieValue);

            var dataProtector = Substitute.For<IDataProtector>();
            dataProtector.Protect(Arg.Any<byte[]>()).Returns((args) => args[0]);
            dataProtector.Unprotect(Arg.Any<byte[]>()).Returns((args) => args[0]);

            var dataProtectionProvider = Substitute.For<IDataProtectionProvider>();
            dataProtectionProvider.CreateProtector(Arg.Any<string>()).Returns(dataProtector);

            var provider = new CookieSessionDataProvider(cookieService, new NullLogger<CookieSessionDataProvider>(), dataProtectionProvider);

            // Act
            provider.Save(key, true);
            var result = provider.Load<bool>(key);

            // Assert
            Assert.That(result, Is.True);
        }

        [Test]
        public void SaveAndLoad_WithStringValue_CorrectlyStoresAndLoadsValue()
        {
            // Arrange
            string cookieValue = null;
            var key = "my-key";
            var value = "my-value";

            var cookieService = Substitute.For<ICookieService>();
            cookieService.When(x => x.IssueCookie(Arg.Any<string>(), Arg.Any<string>())).Do(x => cookieValue = x.ArgAt<string>(1));
            cookieService.GetCookieValue(Arg.Any<string>()).Returns(x => cookieValue);

            var dataProtector = Substitute.For<IDataProtector>();
            dataProtector.Protect(Arg.Any<byte[]>()).Returns((args) => args[0]);
            dataProtector.Unprotect(Arg.Any<byte[]>()).Returns((args) => args[0]);

            var dataProtectionProvider = Substitute.For<IDataProtectionProvider>();
            dataProtectionProvider.CreateProtector(Arg.Any<string>()).Returns(dataProtector);

            var provider = new CookieSessionDataProvider(cookieService, new NullLogger<CookieSessionDataProvider>(), dataProtectionProvider);

            // Act
            provider.Save(key, value);
            var result = provider.Load<string>(key);

            // Assert
            Assert.That(result, Is.EqualTo(value));
        }

        [Test]
        public void SaveAndLoad_WithMissingValue_ReturnsDefaultValue()
        {
            // Arrange
            string cookieValue = null;
            var key = "my-key";

            var cookieService = Substitute.For<ICookieService>();
            cookieService.When(x => x.IssueCookie(Arg.Any<string>(), Arg.Any<string>())).Do(x => cookieValue = x.ArgAt<string>(1));
            cookieService.GetCookieValue(Arg.Any<string>()).Returns(x => cookieValue);

            var dataProtector = Substitute.For<IDataProtector>();
            dataProtector.Protect(Arg.Any<byte[]>()).Returns((args) => args[0]);
            dataProtector.Unprotect(Arg.Any<byte[]>()).Returns((args) => args[0]);

            var dataProtectionProvider = Substitute.For<IDataProtectionProvider>();
            dataProtectionProvider.CreateProtector(Arg.Any<string>()).Returns(dataProtector);

            var provider = new CookieSessionDataProvider(cookieService, new NullLogger<CookieSessionDataProvider>(), dataProtectionProvider);

            // Act
            var result = provider.Load<bool>(key);

            // Assert
            Assert.That(result, Is.False);
        }

        [Test]
        public void SaveAndLoad_WithInvalidType_ReturnsDefaultValue()
        {
            // Arrange
            string cookieValue = null;
            var key = "my-key";

            var cookieService = Substitute.For<ICookieService>();
            cookieService.When(x => x.IssueCookie(Arg.Any<string>(), Arg.Any<string>())).Do(x => cookieValue = x.ArgAt<string>(1));
            cookieService.GetCookieValue(Arg.Any<string>()).Returns(x => cookieValue);

            var dataProtector = Substitute.For<IDataProtector>();
            dataProtector.Protect(Arg.Any<byte[]>()).Returns((args) => args[0]);
            dataProtector.Unprotect(Arg.Any<byte[]>()).Returns((args) => args[0]);

            var dataProtectionProvider = Substitute.For<IDataProtectionProvider>();
            dataProtectionProvider.CreateProtector(Arg.Any<string>()).Returns(dataProtector);

            var provider = new CookieSessionDataProvider(cookieService, new NullLogger<CookieSessionDataProvider>(), dataProtectionProvider);

            // Act
            provider.Save(key, true);
            var result = provider.Load<string>(key);

            // Assert
            Assert.That(result, Is.Null);
        }

        [Test]
        public void Delete_CallsCookieServiceWithNullValue()
        {
            // Arrange
            var key = "my-key";

            var cookieService = Substitute.For<ICookieService>();
            var dataProtectionProvider = Substitute.For<IDataProtectionProvider>();
            var provider = new CookieSessionDataProvider(cookieService, new NullLogger<CookieSessionDataProvider>(), dataProtectionProvider);

            // Act
            provider.Delete(key);

            // Assert
            cookieService.Received().IssueCookie(key, null);
        }
    }
}
