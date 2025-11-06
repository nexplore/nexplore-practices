namespace Nexplore.Practices.Tests.Unit.Core.Security.Cryptography
{
    using System;
    using System.Security.Cryptography;
    using Nexplore.Practices.Core.Security.Cryptography;
    using NSubstitute;
    using NUnit.Framework;

    [TestFixture]
    public class EncryptionServiceTests
    {
        [Test]
        public void Aes_WithSamePassword_CanEncryptAndDecrypt()
        {
            // Arrange
            var inputData = "my input string";
            var password = "my-password";

            var service = new EncryptionService(new StaticSaltGenerationService());

            // Act -> Encrypt
            var encryptedData = service.EncryptDataAes(inputData, password, out byte[] iv);

            // Assert -> Encrypt
            Assert.That(encryptedData, Is.Not.Null.Or.Empty);
            Assert.That(encryptedData, Is.Not.EqualTo(inputData));
            Assert.That(iv, Is.Not.Null.Or.Empty);

            // Act -> Decrypt
            var decryptedData = service.DecryptDataAes(encryptedData, password, iv);

            // Assert -> Decrypt
            Assert.That(decryptedData, Is.EqualTo(inputData));
        }

        [Test]
        public void Aes_WithDifferentPassword_CannotDecrypt()
        {
            // Arrange
            var inputData = "my input string";
            var encryptPassword = "my-encrypt-password";
            var decryptPassword = "my-decrypt-password";

            var service = new EncryptionService(new StaticSaltGenerationService());

            var encryptedData = service.EncryptDataAes(inputData, encryptPassword, out byte[] iv);

            // Act
            TestDelegate act = () => service.DecryptDataAes(encryptedData, decryptPassword, iv);

            // Assert
            Assert.Throws<CryptographicException>(act);
        }

        [Test]
        public void Aes_WithDifferentSalt_CannotDecrypt()
        {
            // Arrange
            var inputData = "my input string";
            var password = "my-password";

            var salt1 = Substitute.For<ISaltGenerationService>();
            salt1.GetSalt().Returns("12345678");

            var salt2 = Substitute.For<ISaltGenerationService>();
            salt2.GetSalt().Returns("87654321");

            var service1 = new EncryptionService(salt1);
            var service2 = new EncryptionService(salt2);

            var encryptedData = service1.EncryptDataAes(inputData, password, out byte[] iv);

            // Act
            TestDelegate act = () => service2.DecryptDataAes(encryptedData, password, iv);

            // Assert
            Assert.Throws<CryptographicException>(act);
        }

        [Test]
        public void Aes_WithInvalidInitializationVector_CannotDecrypt()
        {
            // Arrange
            var inputData = "my input string";
            var password = "my-password";

            var service = new EncryptionService(new StaticSaltGenerationService());

            var encryptedData = service.EncryptDataAes(inputData, password, out byte[] iv);

            // Act
            TestDelegate act = () => service.DecryptDataAes(encryptedData, password, Array.Empty<byte>());

            // Assert
            Assert.Throws<CryptographicException>(act);
        }

        [Test]
        public void Aes_WithMultipleEncryptions_GeneratesDifferentInitializationVectors()
        {
            // Arrange
            var inputData = "my input string";
            var password = "my-password";

            var service = new EncryptionService(new StaticSaltGenerationService());

            // Act
            var encryptedData1 = service.EncryptDataAes(inputData, password, out byte[] iv1);
            var encryptedData2 = service.EncryptDataAes(inputData, password, out byte[] iv2);

            // Assert
            Assert.That(iv1, Is.Not.EqualTo(iv2));
            Assert.That(encryptedData1, Is.Not.EqualTo(encryptedData2));
        }
    }
}
