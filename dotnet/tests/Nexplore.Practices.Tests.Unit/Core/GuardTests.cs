namespace Nexplore.Practices.Tests.Unit.Core
{
    using System;
    using System.Collections.Generic;
    using Nexplore.Practices.Core;
    using NUnit.Framework;

    [TestFixture]
    public class GuardTests
    {
        [Test]
        public void ArgumentNotNull_WithNullValue_ThrowsException()
        {
            // Arrange
            string testValue = null;
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.ArgumentNotNull(testValue, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Not.Null);
            Assert.That(expectedException, Is.InstanceOf<ArgumentNullException>());
            Assert.That(((ArgumentNullException)expectedException).ParamName, Is.EqualTo("testValue"));
        }

        [Test]
        public void ArgumentNotNull_WithNotNullValue_ThrowsNoException()
        {
            // Arrange
            const string testValue = "hello";
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.ArgumentNotNull(testValue, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Null);
        }

        [Test]
        public void ArgumentNotNullOrEmpty_WithNullValue_ThrowsException()
        {
            // Arrange
            string testValue = null;
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.ArgumentNotNullOrEmpty(testValue, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Not.Null);
            Assert.That(expectedException, Is.InstanceOf<ArgumentNullException>());
            Assert.That(((ArgumentNullException)expectedException).ParamName, Is.EqualTo("testValue"));
        }

        [Test]
        public void ArgumentNotNullOrEmpty_WithEmptyValue_ThrowsException()
        {
            // Arrange
            var testValue = string.Empty;
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.ArgumentNotNullOrEmpty(testValue, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            Assert.That(expectedException, Is.Not.Null);
            Assert.That(expectedException, Is.InstanceOf<ArgumentException>());
            Assert.That(((ArgumentException)expectedException).ParamName, Is.EqualTo("testValue"));
        }

        [Test]
        public void ArgumentNotNullOrEmpty_WithNonEmptyValue_ThrowsNoException()
        {
            // Arrange
            const string testValue = "hello";
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.ArgumentNotNullOrEmpty(testValue, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Null);
        }

        [Test]
        public void ArgumentAssert_WithFalseValue_ThrowsException()
        {
            // Arrange
            const bool testValue = false;
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.ArgumentAssert(testValue, "false", "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Not.Null);
            Assert.That(expectedException, Is.InstanceOf<ArgumentException>());
            Assert.That(((ArgumentException)expectedException).ParamName, Is.EqualTo("testValue"));
        }

        [Test]
        public void ArgumentAssert_WithTrueValue_ThrowsNoException()
        {
            // Arrange
            const bool testValue = true;
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.ArgumentAssert(testValue, "true", "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Null);
        }

        [Test]
        public void NotNull_WithNullValue_ThrowsException()
        {
            // Arrange
            const string testValue = null;
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.NotNull(testValue, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Not.Null);
            Assert.That(expectedException, Is.InstanceOf<InvalidOperationException>());
        }

        [Test]
        public void NotNull_WithNonNullValue_ThrowsNoException()
        {
            // Arrange
            const string testValue = "hello";
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.NotNull(testValue, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Null);
        }

        [Test]
        public void NotNullOrEmpty_WithNullValue_ThrowsException()
        {
            // Arrange
            List<int> testValue = null;
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.NotNullOrEmpty(testValue, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Not.Null);
            Assert.That(expectedException, Is.InstanceOf<InvalidOperationException>());
        }

        [Test]
        public void NotNullOrEmpty_WithEmptyValue_ThrowsException()
        {
            // Arrange
            var testValue = new List<int>();
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.NotNullOrEmpty(testValue, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Not.Null);
            Assert.That(expectedException, Is.InstanceOf<InvalidOperationException>());
        }

        [Test]
        public void NotNullOrEmpty_WithNonEmptyValue_ThrowsNoException()
        {
            // Arrange
            var testValue = new List<int> { 1, 2, 3, 4, 5 };
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.NotNullOrEmpty(testValue, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Null);
        }

        [Test]
        public void Assert_WithFalseValue_ThrowsException()
        {
            // Arrange
            const bool testValue = false;
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.Assert(testValue, "false");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Not.Null);
            Assert.That(expectedException, Is.InstanceOf<InvalidOperationException>());
        }

        [Test]
        public void Assert_WithTrueValue_ThrowsNoException()
        {
            // Arrange
            const bool testValue = true;
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.Assert(testValue, "true");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Null);
        }

        [Test]
        public void TypeIsAssignable_WithTargetNullValue_ThrowsException()
        {
            // Arrange
            Type target = null;
            var source = typeof(GuardChild);
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.TypeIsAssignable(target, source, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Not.Null);
            Assert.That(expectedException, Is.InstanceOf<ArgumentNullException>());
            Assert.That(((ArgumentNullException)expectedException).ParamName, Is.EqualTo("assignmentTargetType"));
        }

        [Test]
        public void TypeIsAssignable_WithSourceNullValue_ThrowsException()
        {
            // Arrange
            var target = typeof(GuardParent);
            Type source = null;
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.TypeIsAssignable(target, source, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Not.Null);
            Assert.That(expectedException, Is.InstanceOf<ArgumentNullException>());
            Assert.That(((ArgumentNullException)expectedException).ParamName, Is.EqualTo("assignmentValueType"));
        }

        [Test]
        public void TypeIsAssignable_WithTypeMismatch_ThrowsException()
        {
            // Arrange
            var target = typeof(GuardParent);
            var source = typeof(GuardOther);
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.TypeIsAssignable(target, source, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Not.Null);
            Assert.That(expectedException, Is.InstanceOf<ArgumentException>());
            Assert.That(((ArgumentException)expectedException).ParamName, Is.EqualTo("testValue"));
        }

        [Test]
        public void TypeIsAssignable_WithMistakenIdentity_ThrowsException()
        {
            // Arrange
            var target = typeof(GuardParent);
            var source = typeof(GuardChild);
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.TypeIsAssignable(source, target, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Not.Null);
            Assert.That(expectedException, Is.InstanceOf<ArgumentException>());
            Assert.That(((ArgumentException)expectedException).ParamName, Is.EqualTo("testValue"));
        }

        [Test]
        public void TypeIsAssignable_WithMatch_ThrowsNoException()
        {
            // Arrange
            var target = typeof(GuardParent);
            var source = typeof(GuardChild);
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.TypeIsAssignable(target, source, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Null);
        }

        [Test]
        public void InstanceIsAssignable_WithTargetNullValue_ThrowsException()
        {
            // Arrange
            Type target = null;
            var source = new GuardChild();
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.InstanceIsAssignable(target, source, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Not.Null);
            Assert.That(expectedException, Is.InstanceOf<ArgumentNullException>());
            Assert.That(((ArgumentNullException)expectedException).ParamName, Is.EqualTo("assignmentTargetType"));
        }

        [Test]
        public void InstanceIsAssignable_WithInstanceNullValue_ThrowsException()
        {
            // Arrange
            var target = typeof(GuardParent);
            GuardChild source = null;
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.InstanceIsAssignable(target, source, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Not.Null);
            Assert.That(expectedException, Is.InstanceOf<ArgumentNullException>());
            Assert.That(((ArgumentNullException)expectedException).ParamName, Is.EqualTo("assignmentInstance"));
        }

        [Test]
        public void InstanceIsAssignable_WithTypeMismatch_ThrowsException()
        {
            // Arrange
            var target = typeof(GuardParent);
            var source = new GuardOther();
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.InstanceIsAssignable(target, source, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Not.Null);
            Assert.That(expectedException, Is.InstanceOf<ArgumentException>());
            Assert.That(((ArgumentException)expectedException).ParamName, Is.EqualTo("testValue"));
        }

        [Test]
        public void InstanceIsAssignable_WithMatch_ThrowsNoException()
        {
            // Arrange
            var target = typeof(GuardParent);
            var source = new GuardChild();
            var expectedException = default(Exception);

            // Act
            try
            {
                Guard.InstanceIsAssignable(target, source, "testValue");
            }
            catch (Exception ex)
            {
                expectedException = ex;
            }

            // Assert
            Assert.That(expectedException, Is.Null);
        }

        internal class GuardParent
        {
        }

        internal sealed class GuardChild : GuardParent
        {
        }

        internal sealed class GuardOther
        {
        }
    }
}
