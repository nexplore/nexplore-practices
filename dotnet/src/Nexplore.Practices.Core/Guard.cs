namespace Nexplore.Practices.Core
{
    using System;
    using System.Collections.Generic;
    using System.Globalization;
    using System.Linq;

    using JetBrains.Annotations;

    public static class Guard
    {
        [ContractAnnotation("argumentValue:null => halt")]
        public static void ArgumentNotNull(object argumentValue, [InvokerParameterName] string argumentName)
        {
            if (argumentValue == null)
            {
                throw new ArgumentNullException(argumentName);
            }
        }

        [ContractAnnotation("argumentValue:null => halt")]
        public static void ArgumentNotNullOrEmpty(string argumentValue, [InvokerParameterName] string argumentName)
        {
            if (argumentValue == null)
            {
                throw new ArgumentNullException(argumentName);
            }

            if (argumentValue.Length == 0)
            {
                throw new ArgumentException("The provided string argument must not be empty.", argumentName);
            }
        }

        [ContractAnnotation("expression:false => halt")]
        public static void ArgumentAssert(bool expression, string expressionName, [InvokerParameterName] string argumentName)
        {
            if (!expression)
            {
                throw new ArgumentException("The provided argument expression '" + expressionName + "' evalutes false.", argumentName);
            }
        }

        [ContractAnnotation("value:null => halt")]
        public static void NotNull(object value, string valueName)
        {
            if (value == null)
            {
                throw new InvalidOperationException("The required value '" + valueName + "' is null.");
            }
        }

        [ContractAnnotation("value:null => halt")]
        public static void NotNullOrEmpty<T>(IEnumerable<T> value, string valueName)
        {
            if (value == null)
            {
                throw new InvalidOperationException("The required value '" + valueName + "' is null.");
            }

            if (!value.Any())
            {
                throw new InvalidOperationException("The required value '" + valueName + "' is empty.");
            }
        }

        [ContractAnnotation("expression:false => halt")]
        public static void Assert(bool expression, string expressionName)
        {
            if (!expression)
            {
                throw new InvalidOperationException("'" + expressionName + "' evalutes false.");
            }
        }

        public static void TypeIsAssignable(Type assignmentTargetType, Type assignmentValueType, string argumentName)
        {
            ArgumentNotNull(assignmentTargetType, nameof(assignmentTargetType));
            ArgumentNotNull(assignmentValueType, nameof(assignmentValueType));

            if (!assignmentTargetType.IsAssignableFrom(assignmentValueType))
            {
                throw new ArgumentException(
                    string.Format(
                        CultureInfo.CurrentCulture,
                        "The type {1} cannot be assigned to variables of type {0}.",
                        assignmentTargetType,
                        assignmentValueType),
                    argumentName);
            }
        }

        public static void InstanceIsAssignable(Type assignmentTargetType, object assignmentInstance, string argumentName)
        {
            ArgumentNotNull(assignmentTargetType, "assignmentTargetType");
            ArgumentNotNull(assignmentInstance, "assignmentInstance");

            if (!assignmentTargetType.IsInstanceOfType(assignmentInstance))
            {
                throw new ArgumentException(
                    string.Format(
                        CultureInfo.CurrentCulture,
                        "The type {1} cannot be assigned to variables of type {0}.",
                        assignmentTargetType,
                        GetTypeName(assignmentInstance)),
                    argumentName);
            }
        }

        private static string GetTypeName(object instance)
        {
            try
            {
                return instance.GetType().FullName;
            }
            catch (Exception)
            {
                return "<unknown>";
            }
        }
    }
}
