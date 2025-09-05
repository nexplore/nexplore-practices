namespace Nexplore.Practices.EntityFramework.Conventions
{
    using System;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    using Nexplore.Practices.EntityFramework.Extensions;

    public static class EntityTypeExtensions
    {
        private const string BASE_CLASS_SUFFIX = "Base";

        public static void ToTableByConvention(this EntityTypeBuilder entityTypeBuilder, bool omitBaseIdentifier = false, string entitiesNamespace = EntityExtensions.DEFAULT_ENTITIES_NAMESPACE_PART)
        {
            var entityTypeDisplayName = GetEntityDisplayName(entityTypeBuilder, omitBaseIdentifier);
            var entityTypeSchemaByNamespace = EntityExtensions.GetSchemaFromNamespace(entityTypeBuilder.Metadata.ClrType, entitiesNamespace);

            if (!string.IsNullOrWhiteSpace(entityTypeSchemaByNamespace))
            {
                entityTypeBuilder.ToTable(entityTypeDisplayName, entityTypeSchemaByNamespace);
            }
            else
            {
                entityTypeBuilder.ToTable(entityTypeDisplayName);
            }
        }

        public static string GetEntityDisplayName(this EntityTypeBuilder entityTypeBuilder, bool omitBaseIdentifier = false)
        {
            var entityName = entityTypeBuilder.Metadata.DisplayName();
            if (omitBaseIdentifier && entityName.EndsWith(BASE_CLASS_SUFFIX, StringComparison.Ordinal))
            {
                entityName = entityName.Substring(0, entityName.Length - BASE_CLASS_SUFFIX.Length);
            }

            return entityName;
        }
    }
}
