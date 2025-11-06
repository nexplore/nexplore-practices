namespace Nexplore.Practices.Core.Security.Cryptography
{
    public interface IEncryptionService
    {
        /// <summary>
        /// Encrypts a string.
        /// </summary>
        /// <param name="plainTextInput">Plain text input.</param>
        /// <param name="password">The password to use as key.</param>
        /// <param name="iv">Initialization vector used for decryption.</param>
        /// <param name="keySize">AES key size.</param>
        /// <param name="cipherMode">AES cipher mode.</param>
        /// <param name="paddingMode">AES padding mode.</param>
        /// <returns>Base64 encoded encrypted string.</returns>
        string EncryptDataAes(string plainTextInput, string password, out byte[] iv, AesAllowedKeySize keySize = EncryptionService.DEFAULT_AES_KEY_SIZE, AesAllowedCipherMode cipherMode = EncryptionService.DEFAULT_AES_CIPHER_MODE, AesAllowedPaddingMode paddingMode = EncryptionService.DEFAULT_AES_PADDING);

        /// <summary>
        /// Decrypts a base64 encoded string.
        /// </summary>
        /// <param name="encryptedInput">Encrypted base64 encoded string.</param>
        /// <param name="password">The password to use as key.</param>
        /// <param name="iv">The initialization vector used for encryption.</param>
        /// /// <param name="keySize">AES key size.</param>
        /// <param name="cipherMode">AES cipher mode.</param>
        /// <param name="paddingMode">AES padding mode.</param>
        /// <returns>Plain text string.</returns>
        string DecryptDataAes(string encryptedInput, string password, byte[] iv, AesAllowedKeySize keySize = EncryptionService.DEFAULT_AES_KEY_SIZE, AesAllowedCipherMode cipherMode = EncryptionService.DEFAULT_AES_CIPHER_MODE, AesAllowedPaddingMode paddingMode = EncryptionService.DEFAULT_AES_PADDING);
    }
}
