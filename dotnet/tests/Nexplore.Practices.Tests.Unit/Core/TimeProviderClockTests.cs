namespace Nexplore.Practices.Tests.Unit.Core
{
    using System;
    using Nexplore.Practices.Core;
    using NSubstitute;
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

        [Test]
        public void Values_WithCustomLocalTimeZone_AreDerivedFromTimeProvider()
        {
            // Arrange
            var utcNow = new DateTimeOffset(2024, 1, 1, 23, 30, 0, TimeSpan.Zero);
            var localTimeZone = TimeZoneInfo.CreateCustomTimeZone("Test/UTC+02", TimeSpan.FromHours(2), "Test/UTC+02", "Test/UTC+02");
            var timeProvider = NSubstitute.Substitute.For<TimeProvider>();
            timeProvider.GetUtcNow().Returns(utcNow);
            timeProvider.LocalTimeZone.Returns( localTimeZone);
            var clock = new TimeProviderClock(timeProvider);

            // Act & Assert
            Assert.Multiple(() =>
            {
                Assert.That(clock.UtcNowOffset, Is.EqualTo(utcNow));
                Assert.That(clock.NowOffset, Is.EqualTo(new DateTimeOffset(2024, 1, 2, 1, 30, 0, TimeSpan.FromHours(2))));
                Assert.That(clock.UtcNow, Is.EqualTo(new DateTime(2024, 1, 1, 23, 30, 0, DateTimeKind.Utc)));
                Assert.That(clock.Now, Is.EqualTo(new DateTime(2024, 1, 2, 1, 30, 0, DateTimeKind.Local)));
                Assert.That(clock.UtcToday, Is.EqualTo(new DateOnly(2024, 1, 1)));
                Assert.That(clock.Today, Is.EqualTo(new DateOnly(2024, 1, 2)));
            });
        }
    }
}
