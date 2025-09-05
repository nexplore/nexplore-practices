namespace Nexplore.Practices.Tests.Unit.Web.Localization
{
    using System;
    using Microsoft.Extensions.Localization;
    using Microsoft.Extensions.Logging;
    using Nexplore.Practices.Web.Localization;
    using NSubstitute;
    using NUnit.Framework;

    [TestFixture]
    public class StringLocalizerWithFormatTests
    {
        private StringLocalizerWithFormat formatStringLocalizer;
        private ResourceManagerStringLocalizer defaultStringLocalizer;

        [OneTimeSetUp]
        public void Initialize()
        {
            var resourceType = typeof(TestResource);
            var resourceNamespace = resourceType.Namespace;
            var resourceAssembly = resourceType.Assembly;
            var logger = Substitute.For<ILogger>();

            this.defaultStringLocalizer = new ResourceManagerStringLocalizer(TestResource.ResourceManager, resourceAssembly, resourceNamespace!, new ResourceNamesCache(), logger);
            this.formatStringLocalizer = new StringLocalizerWithFormat(this.defaultStringLocalizer);
        }

        [Test]
        public void StringIndexerGet_WithCompositeStringFormat_FormatsString()
        {
            // Inputs such as "{ 0 }" - will invoke base impl to retrieve and format the string

            // Act
            var result = this.formatStringLocalizer[nameof(TestResource.CompositeFormat), "Bar"];

            // Assert
            Assert.That(result.Value, Is.EqualTo("Foo Bar"));
        }

        [Test]
        public void StringIndexerGet_WithCompositeStringFormatWithFloatFormatter_FormatsString()
        {
            // Inputs such as "{ 0:00.0 }" - will invoke base impl to retrieve and format the string

            // Act
            var result = this.formatStringLocalizer[nameof(TestResource.CompositeFormatWithFloatFormatter), -Math.PI];

            // Assert
            Assert.That(result.Value, Is.EqualTo("Foo -03.1"));
        }

        [Test]
        public void StringIndexerGet_WithTemplateFormat_FormatsString()
        {
            // Inputs such as "{{ bar }}"

            // Act
            var result = this.formatStringLocalizer[nameof(TestResource.TemplateFormat), ("bar", "Bar")];

            // Assert
            Assert.That(result.Value, Is.EqualTo("Foo Bar"));
        }

        [Test]
        public void StringIndexerGet_WithTemplateFormatContainingNoSpaces_FormatsString()
        {
            // Inputs such as "{{bar}}"

            // Act
            var result = this.formatStringLocalizer[nameof(TestResource.TemplateFormatWithoutSpaces), ("bar", "Bar")];

            // Assert
            Assert.That(result.Value, Is.EqualTo("Foo Bar"));
        }

        [Test]
        public void StringIndexerGet_WithTemplateFormatContainingUnevenSpaces_FormatsString()
        {
            // Inputs such as "{{bar      }}"

            // Act
            var result = this.formatStringLocalizer[nameof(TestResource.TemplateFormatWithUnevenSpaces), ("bar", "Bar")];

            // Assert
            Assert.That(result.Value, Is.EqualTo("Foo Bar"));
        }

        [Test]
        public void StringIndexerGet_WithNestedTemplateFormats_DoesNotFormatNestedStrings()
        {
            // Inputs such as "{{ bar{{baz}} }}"

            // Act
            var result = this.formatStringLocalizer[nameof(TestResource.TemplateFormatWithNestedTemplateFormat), ("bar", "Bar"), ("bazBar", "Bar") /* won't work */];

            // Assert
            Assert.That(result.Value, Is.EqualTo("Foo { bazBar }"));
        }

        [Test]
        public void StringIndexerGet_WithTemplateFormatContainingRecurringTemplates_FormatsAllOccurrences()
        {
            // Inputs such as "{{ bar }}{{ bar }}"

            // Act
            var result = this.formatStringLocalizer[nameof(TestResource.TemplateFormatWithRecurrence), ("bar", "Bar")];

            // Assert
            Assert.That(result.Value, Is.EqualTo("Foo BarBar"));
        }

        [Test]
        public void StringIndexerGet_WithMixedFormatAndCorrectArguments_FormatsString()
        {
            // Arrange
            var argA = "Baz";
            var argB = "Baz2";
            var argC = ("bar", "Bar");

            // Act
            var result = this.formatStringLocalizer[nameof(TestResource.MixedFormat), argA, argB, argC];   // {0} {{ bar }} {1}
            var result2 = this.formatStringLocalizer[nameof(TestResource.MixedFormat2), argA, argC, argB]; // {0} {{ bar }} {2}
            var result2WithWrongArgumentOrder = this.formatStringLocalizer[nameof(TestResource.MixedFormat2), argA, argB, argC]; // {0} {{ bar }} {2}

            // Assert
            Assert.That(result.Value, Is.EqualTo(result2.Value));
            Assert.That(result.Value, Is.EqualTo("Foo Baz Bar Baz2"));
            Assert.That(result2WithWrongArgumentOrder.Value, Is.EqualTo($"Foo Baz Bar {argC.ToString()}"));
        }

        [Test]
        public void StringIndexerGet_WithLongMixedFormatWithLineBreaksAndContainingRecurringTemplatesAndIndices_FormatsAllOccurrences()
        {
            // Act
            var result = this.formatStringLocalizer[nameof(TestResource.LongMixedFormat), "amet", ("dolor", "dolor")];

            // Assert
            Assert.That(result.Value, Is.EqualTo(TestResource.LongFormatExpected));
        }

        [Test]
        public void StringIndexerGet_WithTemplateFormatAndTooManyTemplateArguments_DoesNotThrow()
        {
            Assert.DoesNotThrow(() => _ = this.formatStringLocalizer[nameof(TestResource.TemplateFormat), ("bar", "Bar"), ("bar", "Bar")]);
        }

        [Test]
        public void StringIndexerGet_WithCompositeFormatAndTooManyArguments_DoesNotThrow()
        {
            Assert.DoesNotThrow(() => _ = this.formatStringLocalizer[nameof(TestResource.CompositeFormat), "Bar", "Baz", "Lorem", "Ipsum"]);
        }

        [Test]
        public void StringIndexerGet_WithMissingArgsForCompositeString_ThrowsFormatException()
        {
            Assert.Throws<FormatException>(() => _ = this.formatStringLocalizer[nameof(TestResource.CompositeFormatWithTwoIndicies), "First Index" /* intentionally omitted */]);
        }

        [Test]
        public void StringIndexerGet_WithMissingArgsForTemplateString_ThrowsFormatException()
        {
            Assert.Throws<FormatException>(() => _ = this.formatStringLocalizer[nameof(TestResource.TemplateFormatWithTwoKeys), ("bar", "First Key") /* intentionally omitted */]);
        }
    }
}
