namespace Nexplore.Practices.EntityFramework.Validation
{
    using System;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.ComponentModel.DataAnnotations;
    using System.Linq;
    using System.Text.RegularExpressions;
    using System.Threading;
    using System.Threading.Tasks;
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

        public async Task<IReadOnlyCollection<EntityValidationResult>> ValidateAsync(bool detectChangesOnChangeTracker = true, CancellationToken cancellationToken = default)
        {
            if (detectChangesOnChangeTracker)
            {
                this.changeTracker.DetectChanges();
            }

            var entriesToValidate = this.changeTracker.Entries<IValidatable>().Where(this.IsEntityEntryChanged).ToArray();
            return await this.ValidateMultipleEntitiesAsync(entriesToValidate.Select(e => e.Entity), cancellationToken).ConfigureAwait(false);
        }

        protected virtual bool IsEntityEntryChanged(EntityEntry<IValidatable> entry)
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

        private async Task<IReadOnlyCollection<EntityValidationResult>> ValidateMultipleEntitiesAsync(IEnumerable<IValidatable> entities, CancellationToken cancellationToken)
        {
            var result = new List<EntityValidationResult>();

            foreach (var validatable in entities)
            {
                var validationResult = await this.ValidateSingleEntityAsync(validatable, cancellationToken).ConfigureAwait(false);
                if (validationResult != null)
                {
                    result.Add(validationResult);
                }
            }

            return result;
        }

        private async Task<EntityValidationResult> ValidateSingleEntityAsync(IValidatable entity, CancellationToken cancellationToken)
        {
            var validationErrors = new List<EntityValidationError>();

            if(entity is IValidatable<TValidationContext> syncValidatable)
            {
                validationErrors.AddRange(this.ValidateDataAnnotationAttributes(syncValidatable));
            }

            if (entity is IAsyncValidatable<TValidationContext> asyncValidatable)
            {
                validationErrors.AddRange(await asyncValidatable.ValidateAsync(this.validationContext, cancellationToken).ConfigureAwait(false));
            }

            return validationErrors.Count == 0 ? null : new EntityValidationResult(entity, validationErrors);
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
    }
}
