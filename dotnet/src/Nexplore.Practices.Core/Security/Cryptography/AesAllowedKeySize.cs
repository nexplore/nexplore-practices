using System.Diagnostics.CodeAnalysis;

namespace Nexplore.Practices.Core.Security.Cryptography
{
    public enum AesAllowedKeySize
    {
        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        Size_256,
    }
}
