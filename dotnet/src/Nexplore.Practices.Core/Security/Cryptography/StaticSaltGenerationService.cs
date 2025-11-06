namespace Nexplore.Practices.Core.Security.Cryptography
{
    /// <summary>
    /// This implementation returns always the same salt.
    /// </summary>
    public class StaticSaltGenerationService : ISaltGenerationService
    {
        public string GetSalt()
        {
            return "d7ae1480-d7fe-4a7c-a326-c64d62a3499b";
        }
    }
}
