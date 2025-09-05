namespace Nexplore.Practices.EntityFramework.Validation
{
    using System;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.ComponentModel.DataAnnotations;
    using System.Linq;
    using System.Text.RegularExpressions;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.ChangeTracking;
    using Microsoft.Extensions.Localization;
    using Nexplore.Practices.Core.Domain.Model;
    using Nexplore.Practices.Core.Localization;
    using Nexplore.Practices.Core.Validation;

    public class ValidationProvider<TValidationContext> : IValidationProvider
    {
        private static readonly Regex requiredAttribute = new Regex("The (.*) field is required\\."); // RequiredAttribute
        private static readonly Regex stringLengthAttribute = new Regex("The field (.*) must be a string with a maximum length of (.*)\\."); // StringLengthAttribute
        private static readonly Regex stringLengthWithMinAttribute = new Regex("The field (.*) must be a string with a minimum length of (.*) and a maximum length of (.*)\\."); // StringLengthAttribute
        private static readonly Regex maxLengthAttribute = new Regex("The field (.*) must be a string or array type with a maximum length of '(.*)'\\."); // MaxLengthAttribute

        private readonly TValidationContext validationContext;
        private readonly ChangeTracker changeTracker;
        private readonly IStringLocalizer validationLocalizer;

        public ValidationProvider(TValidationContext validationContext, ChangeTracker changeTracker, IStringLocalizerFactory stringLocalizerFactory)
        {
            this.validationContext = validationContext;
            this.changeTracker = changeTracker;

            this.validationLocalizer = stringLocalizerFactory.Create(typeof(ValidationResourceNames));
        }

        public IEnumerable<EntityValidationResult> Validate(bool detectChangesOnChangeTracker = true)
        {
            if (detectChangesOnChangeTracker)
            {
                this.changeTracker.DetectChanges();
            }

            var entriesToValidate = this.changeTracker.Entries<IValidatable<TValidationContext>>().Where(this.IsEntityEntryChanged).ToArray();
            return this.ValidateMultipleEntities(entriesToValidate.Select(e => e.Entity));
        }

        protected virtual bool IsEntityEntryChanged(EntityEntry<IValidatable<TValidationContext>> entry)
        {
            switch (entry.State)
            {
                case EntityState.Deleted:
                    return false;
                default:
                    return true;
            }
        }

        protected virtual string GetLocalizedMessageOrDefault(ValidationResult result)
        {
            var possibleValidationAttributeMessage = result.MemberNames.Count() == 1;
            if (possibleValidationAttributeMessage)
            {
                var requiredAttributeMatch = requiredAttribute.Match(result.ErrorMessage);
                if (requiredAttributeMatch.Success)
                {
                    return this.validationLocalizer[ValidationResourceNames.REQUIRED];
                }

                var stringLengthAttributeMatch = stringLengthAttribute.Match(result.ErrorMessage);
                if (stringLengthAttributeMatch.Success)
                {
                    var maximumLength = stringLengthAttributeMatch.Groups[2].Value;
                    return this.validationLocalizer[ValidationResourceNames.STRING_MAX_LENGTH, ("requiredLength", maximumLength)];
                }

                var stringLengthWithMinAttributeMatch = stringLengthWithMinAttribute.Match(result.ErrorMessage);
                if (stringLengthWithMinAttributeMatch.Success)
                {
                    var minimumLength = stringLengthWithMinAttributeMatch.Groups[2].Value;
                    var maximumLength = stringLengthWithMinAttributeMatch.Groups[3].Value;
                    return this.validationLocalizer[ValidationResourceNames.STRING_MIN_AND_MAX_LENGTH, ("minimumLength", minimumLength), ("maximumLength", maximumLength)];
                }

                var maxLengthAttributeMatch = maxLengthAttribute.Match(result.ErrorMessage);
                if (maxLengthAttributeMatch.Success)
                {
                    var maximumLength = maxLengthAttributeMatch.Groups[2].Value;
                    return this.validationLocalizer[ValidationResourceNames.MAX_LENGTH, ("requiredLength", maximumLength)];
                }
            }

            return null;
        }

        private IEnumerable<EntityValidationResult> ValidateMultipleEntities(IEnumerable<IValidatable<TValidationContext>> entities)
        {
            return entities.Select(this.ValidateSingleEntity).Where(result => result != null);
        }

        private EntityValidationResult ValidateSingleEntity(IValidatable<TValidationContext> entity)
        {
            var unitedValidationErrors = this.ValidateDataAnnotationAttributes(entity).Union(this.ValidateValidatable(entity)).ToArray();
            if (unitedValidationErrors.Length == 0)
            {
                return null;
            }

            var validationErrors = new ReadOnlyCollection<EntityValidationError>(unitedValidationErrors);
            return new EntityValidationResult(entity, validationErrors);
        }

        private IEnumerable<EntityValidationError> ValidateDataAnnotationAttributes(IValidatable<TValidationContext> entity)
        {
            var dataAnnotationValidationContext = new ValidationContext(entity);
            var dataAnnotationResults = new Collection<ValidationResult>();
            Validator.TryValidateObject(entity, dataAnnotationValidationContext, dataAnnotationResults, validateAllProperties: true);

            foreach (var dataAnnotationResult in dataAnnotationResults)
            {
                var errorMessage = this.GetLocalizedMessageOrDefault(dataAnnotationResult);
                if (errorMessage == null)
                {
                    throw new NotSupportedException($"Not supported data annotation validation in entity '{entity.GetType().Name}'. Only database schema relevant annotations are supported.");
                }

                yield return new EntityValidationError(errorMessage, dataAnnotationResult.MemberNames.Single());
            }
        }

        private IEnumerable<EntityValidationError> ValidateValidatable(IValidatable<TValidationContext> entity)
        {
            return entity.Validate(this.validationContext);
        }
    }
}
