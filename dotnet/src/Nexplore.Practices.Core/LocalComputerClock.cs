namespace Nexplore.Practices.Core
{
    using System;

    public class LocalComputerClock : IClock
    {
        public DateTime Now => DateTime.Now;

        public DateTime UtcNow => DateTime.UtcNow;

        public DateTime Today => DateTime.Now.Date;

        public DateTime UtcToday => DateTime.UtcNow.Date;
    }
}