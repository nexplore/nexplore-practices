namespace Nexplore.Practices.Tests.Unit.Core
{
    using System;
    using Nexplore.Practices.Core;
    using NUnit.Framework;

    [TestFixture]
    public class TimeProviderClockTests
    {
        [Test]
        public void Now_WithDefault_IsOfKindLocal()
        {
            // Arrange
            var clock = new TimeProviderClock(TimeProvider.System);

            // Act
            var result = clock.Now;

            // Assert
            Assert.That(result.Kind, Is.EqualTo(DateTimeKind.Local));
        }

        [Test]
        public void UtcNow_WithDefault_IsOfKindUtc()
        {
            // Arrange
            var clock = new TimeProviderClock(TimeProvider.System);

            // Act
            var result = clock.UtcNow;

            // Assert
            Assert.That(result.Kind, Is.EqualTo(DateTimeKind.Utc));
        }

        [Test]
        public void Now_WithDefault_ContainsTimeInformation()
        {
            // Arrange
            var clock = new TimeProviderClock(TimeProvider.System);

            // Act
            var result = clock.Now;

            // Assert
            Assert.That(result.TimeOfDay, Is.Not.EqualTo(TimeSpan.Zero));
        }

        [Test]
        public void UtcNow_WithDefault_ContainsTimeInformation()
        {
            // Arrange
            var clock = new TimeProviderClock(TimeProvider.System);

            // Act
            var result = clock.UtcNow;

            // Assert
            Assert.That(result.TimeOfDay, Is.Not.EqualTo(TimeSpan.Zero));
        }

        [Test]
        public void NowOffset_ContainsTimeInformation()
        {
            // Arrange
            var clock = new TimeProviderClock(TimeProvider.System);

            // Act
            var result = clock.NowOffset;

            // Assert
            Assert.That(result.TimeOfDay, Is.Not.EqualTo(TimeSpan.Zero));
        }

        [Test]
        public void UtcNowOffset_ContainsTimeInformation()
        {
            // Arrange
            var clock = new TimeProviderClock(TimeProvider.System);

            // Act
            var result = clock.UtcNowOffset;

            // Assert
            Assert.That(result.TimeOfDay, Is.Not.EqualTo(TimeSpan.Zero));
        }
    }
}
