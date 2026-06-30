namespace Nexplore.Practices.Core
{
    using System;

    public class LocalComputerClock : IClock
    {
        public DateTime Now => DateTime.Now;
        public DateTime UtcNow => DateTime.UtcNow;

        public DateTimeOffset NowOffset => DateTimeOffset.Now;
        public DateTimeOffset UtcNowOffset => DateTimeOffset.UtcNow;

        public DateOnly Today => DateOnly.FromDateTime(DateTime.Now);
        public DateOnly UtcToday => DateOnly.FromDateTime(DateTime.UtcNow);
    }
}