namespace Nexplore.Practices.Core.Validation
{
    using System;
    using System.Collections.Generic;
    using Nexplore.Practices.Core.Domain.Model;

    public class EntityValidationResult
    {
        private const string ENTITY_PROXY_SUFFIX = "Proxy";

        public EntityValidationResult(IValidatable entity, IReadOnlyCollection<EntityValidationError> validationErrors)
        {
            this.Entity = entity;
            this.ValidationErrors = validationErrors ?? Array.Empty<EntityValidationError>();
        }

        public IValidatable Entity { get; }

        public IReadOnlyCollection<EntityValidationError> ValidationErrors { get; }

        public string GetEntityName()
        {
            if (this.Entity == null)
            {
                return "NULL";
            }

            var entityTypeName = this.Entity.GetType().Name;

            if (entityTypeName.EndsWith(ENTITY_PROXY_SUFFIX, StringComparison.InvariantCultureIgnoreCase))
            {
                return entityTypeName.Substring(0, entityTypeName.Length - ENTITY_PROXY_SUFFIX.Length);
            }

            return entityTypeName;
        }

        public override string ToString()
        {
            var errorMessage = string.Join(Environment.NewLine, this.ValidationErrors);

            return $"Entity of type='{this.GetEntityName()}' is not valid:{Environment.NewLine}{errorMessage}";
        }
    }
}
