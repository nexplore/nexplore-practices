namespace Nexplore.Practices.EntityFramework.Extensions
{
    using System;
    using System.Diagnostics.CodeAnalysis;

    public static class EntityExtensions
    {
        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        public const string DEFAULT_ENTITIES_SCHEMA = "dbo";

        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        public const string DEFAULT_ENTITIES_NAMESPACE_PART = "Entities";

        public static string GetSchemaFromNamespace(Type entityType, string entitiesNamespacePart = DEFAULT_ENTITIES_NAMESPACE_PART)
        {
            return GetSchemaFromNamespace(entityType.Namespace, entitiesNamespacePart);
        }

        [SuppressMessage("Microsoft.Globalization", "CA1308:NormalizeStringsToUppercase", Justification = "We have only latin chars in our namespace parts.")]
        public static string GetSchemaFromNamespace(string entityNamespace, string entitiesNamespacePart = DEFAULT_ENTITIES_NAMESPACE_PART)
        {
            if (string.IsNullOrWhiteSpace(entityNamespace))
            {
                return string.Empty;
            }

            var namespaceParts = entityNamespace.Split('.');
            var entitiesIndex = Array.IndexOf(namespaceParts, entitiesNamespacePart);

            return entitiesIndex > 0 ? namespaceParts[entitiesIndex - 1].ToLowerInvariant() : string.Empty;
        }
    }
}
