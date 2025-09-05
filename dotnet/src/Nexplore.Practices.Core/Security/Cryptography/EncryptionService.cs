namespace Nexplore.Practices.Core.Security.Cryptography
{
    using System;
    using System.Diagnostics.CodeAnalysis;
    using System.IO;
    using System.Security.Cryptography;
    using System.Text;

    public class EncryptionService : IEncryptionService
    {
        private readonly ISaltGenerationService saltGenerationService;

        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        public const AesAllowedKeySize DEFAULT_AES_KEY_SIZE = AesAllowedKeySize.Size_256;

        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        public const AesAllowedCipherMode DEFAULT_AES_CIPHER_MODE = AesAllowedCipherMode.CBC;

        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        public const AesAllowedPaddingMode DEFAULT_AES_PADDING = AesAllowedPaddingMode.PKCS7;

        public EncryptionService(ISaltGenerationService saltGenerationService)
        {
            this.saltGenerationService = saltGenerationService;
        }

        public string EncryptDataAes(string plainTextInput, string password, out byte[] iv, AesAllowedKeySize keySize = DEFAULT_AES_KEY_SIZE, AesAllowedCipherMode cipherMode = DEFAULT_AES_CIPHER_MODE, AesAllowedPaddingMode paddingMode = DEFAULT_AES_PADDING)
        {
            var salt = this.saltGenerationService.GetSalt();

            using (var algorithm = GetAlgorithm(password, salt, keySize, cipherMode, paddingMode))
            using (var encryptor = algorithm.CreateEncryptor(algorithm.Key, algorithm.IV))
            using (var encryptStream = new MemoryStream())
            using (var cryptoStream = new CryptoStream(encryptStream, encryptor, CryptoStreamMode.Write))
            {
                using (var streamWriter = new StreamWriter(cryptoStream))
                {
                    streamWriter.Write(plainTextInput);
                }

                iv = algorithm.IV;

                return Convert.ToBase64String(encryptStream.ToArray());
            }
        }

        public string DecryptDataAes(string encryptedInput, string password, byte[] iv, AesAllowedKeySize keySize = DEFAULT_AES_KEY_SIZE, AesAllowedCipherMode cipherMode = DEFAULT_AES_CIPHER_MODE, AesAllowedPaddingMode paddingMode = DEFAULT_AES_PADDING)
        {
            var encryptedInputArray = Convert.FromBase64String(encryptedInput);

            var salt = this.saltGenerationService.GetSalt();

            using (var algorithm = GetAlgorithm(password, salt, keySize, cipherMode, paddingMode, iv))
            using (var decryptor = algorithm.CreateDecryptor(algorithm.Key, algorithm.IV))
            using (var decryptStream = new MemoryStream(encryptedInputArray))
            using (var cryptoStream = new CryptoStream(decryptStream, decryptor, CryptoStreamMode.Read))
            using (var streamReader = new StreamReader(cryptoStream))
            {
                return streamReader.ReadToEnd();
            }
        }

        private static Aes GetAlgorithm(string password, string salt, AesAllowedKeySize keySize, AesAllowedCipherMode cipherMode, AesAllowedPaddingMode paddingMode, byte[] iv = null)
        {
            int aesKeySize;
            switch (keySize)
            {
                case AesAllowedKeySize.Size_256:
                    aesKeySize = 256;
                    break;
                default:
                    throw new InvalidOperationException($"Key size {keySize} is not supported.");
            }

            CipherMode aesCipherMode;
            switch (cipherMode)
            {
                case AesAllowedCipherMode.CBC:
                    aesCipherMode = CipherMode.CBC;
                    break;
                default:
                    throw new InvalidOperationException($"Cipher mode {cipherMode} is not supported.");
            }

            PaddingMode aesPadding;
            switch (paddingMode)
            {
                case AesAllowedPaddingMode.PKCS7:
                    aesPadding = PaddingMode.PKCS7;
                    break;
                default:
                    throw new InvalidOperationException($"Padding mode {paddingMode} is not supported.");
            }

            var provider = Aes.Create();
            if (provider == null)
            {
                throw new InvalidOperationException("AES crypto provider could not be created");
            }

            provider.Padding = aesPadding;
            provider.Mode = aesCipherMode;
            provider.KeySize = aesKeySize;
            provider.Key = GetKey(password, salt, aesKeySize);

            if (iv != null)
            {
                provider.IV = iv;
            }

            return provider;
        }

        private static byte[] GetKey(string password, string salt, int aesKeySize)
        {
            Guard.ArgumentNotNullOrEmpty(password, nameof(password));

            var key = new Rfc2898DeriveBytes(password, Encoding.UTF8.GetBytes(salt), iterations: 1000, HashAlgorithmName.SHA256);
            return key.GetBytes(aesKeySize / 8);
        }
    }
}
