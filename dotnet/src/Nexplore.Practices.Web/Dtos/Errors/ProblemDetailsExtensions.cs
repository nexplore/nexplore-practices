namespace Nexplore.Practices.Web.Dtos.Errors
{
    using System;
    using System.Collections.Generic;
    using System.Text.Json;
    using Microsoft.AspNetCore.Mvc;

    public static class ProblemDetailsExtensions
    {
        public static void SetOriginalMessage(this ProblemDetails problemDetails, string originalMessage)
            => problemDetails.Extensions[Keys.OriginalMessage] = originalMessage;

        public static string GetOriginalMessage(this ProblemDetails problemDetails)
            => problemDetails.GetExtensionStringOrDefault(Keys.OriginalMessage);

        public static void SetStackTrace(this ProblemDetails problemDetails, string stackTrace)
            => problemDetails.Extensions[Keys.StackTrace] = stackTrace;

        public static string GetStackTrace(this ProblemDetails problemDetails)
            => problemDetails.GetExtensionStringOrDefault(Keys.StackTrace);

        public static void SetCorrelationId(this ProblemDetails problemDetails, Guid? correlationId)
            => problemDetails.Extensions[Keys.CorrelationId] = correlationId;

        public static Guid? GetCorrelationId(this ProblemDetails problemDetails)
        {
            if (problemDetails.Extensions.TryGetValue(Keys.CorrelationId, out var value))
            {
                if (value is Guid guidValue)
                {
                    return guidValue;
                }
                else if (value is JsonElement jsonElement)
                {
                    if (jsonElement.TryGetGuid(out Guid guidElement))
                    {
                        return guidElement;
                    }
                }
            }

            return null;
        }

        public static void SetValidationResults(this ProblemDetails problemDetails, IReadOnlyCollection<EntityValidationResultDto> validationResults)
            => problemDetails.Extensions[Keys.ValidationResults] = validationResults;

        private static string GetExtensionStringOrDefault(this ProblemDetails problemDetails, string key)
        {
            if (problemDetails.Extensions.TryGetValue(key, out var value))
            {
                if (value is string stringValue)
                {
                    return stringValue;
                }
                else if (value is JsonElement jsonElement)
                {
                    return jsonElement.GetString();
                }
            }

            return null;
        }

        public static class Keys
        {
            public const string OriginalMessage = "originalMessage";
            public const string StackTrace = "stackTrace";
            public const string CorrelationId = "correlationId";
            public const string ValidationResults = "validationResults";
            public const string TraceId = "traceId";
        }
    }
}
