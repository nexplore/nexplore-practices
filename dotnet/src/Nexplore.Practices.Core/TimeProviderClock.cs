namespace Nexplore.Practices.Core
{
    using System;

    public class TimeProviderClock : IClock
    {
        private readonly TimeProvider timeProvider;

        public TimeProviderClock(TimeProvider timeProvider)
        {
            this.timeProvider = timeProvider;
        }

        public DateTime Now => DateTime.SpecifyKind(this.NowOffset.DateTime, DateTimeKind.Local);
        public DateTime UtcNow => this.UtcNowOffset.UtcDateTime;

        public DateTimeOffset NowOffset => this.timeProvider.GetLocalNow();
        public DateTimeOffset UtcNowOffset => this.timeProvider.GetUtcNow();

        public DateOnly Today => DateOnly.FromDateTime(this.Now);
        public DateOnly UtcToday => DateOnly.FromDateTime(this.UtcNow);
    }
}