namespace Nexplore.Practices.Tests.Unit.Core
{
    using System;
    using Nexplore.Practices.Core;
    using NUnit.Framework;

    [TestFixture]
    public class LocalComputerClockTests
    {
        [Test]
        public void Now_WithDefault_IsOfKindLocal()
        {
            // Arrange
            var clock = new LocalComputerClock();

            // Act
            var result = clock.Now;

            // Assert
            Assert.That(result.Kind, Is.EqualTo(DateTimeKind.Local));
        }

        [Test]
        public void UtcNow_WithDefault_IsOfKindUtc()
        {
            // Arrange
            var clock = new LocalComputerClock();

            // Act
            var result = clock.UtcNow;

            // Assert
            Assert.That(result.Kind, Is.EqualTo(DateTimeKind.Utc));
        }

        [Test]
        public void Today_WithDefault_IsOfKindLocal()
        {
            // Arrange
            var clock = new LocalComputerClock();

            // Act
            var result = clock.Today;

            // Assert
            Assert.That(result.Kind, Is.EqualTo(DateTimeKind.Local));
        }

        [Test]
        public void UtcToday_WithDefault_IsOfKindUtc()
        {
            // Arrange
            var clock = new LocalComputerClock();

            // Act
            var result = clock.UtcToday;

            // Assert
            Assert.That(result.Kind, Is.EqualTo(DateTimeKind.Utc));
        }

        [Test]
        public void Now_WithDefault_ContainsTimeInformation()
        {
            // Arrange
            var clock = new LocalComputerClock();

            // Act
            var result = clock.Now;

            // Assert
            Assert.That(result.TimeOfDay, Is.Not.EqualTo(TimeSpan.Zero));
        }

        [Test]
        public void UtcNow_WithDefault_ContainsTimeInformation()
        {
            // Arrange
            var clock = new LocalComputerClock();

            // Act
            var result = clock.UtcNow;

            // Assert
            Assert.That(result.TimeOfDay, Is.Not.EqualTo(TimeSpan.Zero));
        }

        [Test]
        public void Today_WithDefault_DoesNotContainTimeInformation()
        {
            // Arrange
            var clock = new LocalComputerClock();

            // Act
            var result = clock.Today;

            // Assert
            Assert.That(result.TimeOfDay, Is.EqualTo(TimeSpan.Zero));
        }

        [Test]
        public void UtcToday_WithDefault_DoesNotContainTimeInformation()
        {
            // Arrange
            var clock = new LocalComputerClock();

            // Act
            var result = clock.UtcToday;

            // Assert
            Assert.That(result.TimeOfDay, Is.EqualTo(TimeSpan.Zero));
        }
    }
}
