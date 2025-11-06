using System.Diagnostics.CodeAnalysis;

namespace Nexplore.Practices.Core
{
    public struct PracticesConstants
    {
        public struct User
        {
            [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
            [SuppressMessage("ReSharper", "InconsistentNaming")]
            public const string SYSTEM_NAME = "System";
        }

        public struct Configuration
        {
            [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
            [SuppressMessage("ReSharper", "InconsistentNaming")]
            public const string APPSETTINGS_NAME = "appsettings.json";

            [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
            [SuppressMessage("ReSharper", "InconsistentNaming")]
            public const string APPSETTINGS_OVERRIDE_NAME = "appsettings.override.json";
        }

        public struct Scopes
        {
            [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
            [SuppressMessage("ReSharper", "InconsistentNaming")]
            public const string TOP_LEVEL_CHILD_SCOPE_TAG = nameof(TOP_LEVEL_CHILD_SCOPE_TAG);
        }
    }
}
