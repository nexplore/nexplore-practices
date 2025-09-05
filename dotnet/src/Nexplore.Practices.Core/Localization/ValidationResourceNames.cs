using System.Diagnostics.CodeAnalysis;

namespace Nexplore.Practices.Core.Localization
{
    public struct ValidationResourceNames
    {
        public const string REQUIRED = "Validation_Required";

        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        public const string STRING_MAX_LENGTH = "Validation_StringMaxLength";

        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        public const string STRING_MIN_AND_MAX_LENGTH = "Validation_StringMinAndMaxLength";

        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        public const string MAX_LENGTH = "Validation_Maxlength"; // "l" is small to match Angular validator name

        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        public const string INVALID_DATE_PATTERN = "Validation_InvalidDatePattern";

        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        public const string MIN_DATE = "Validation_MinDate";

        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        public const string MAX_DATE = "Validation_MaxDate";
    }
}
