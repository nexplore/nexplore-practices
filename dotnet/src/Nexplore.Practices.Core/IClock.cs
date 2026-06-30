namespace Nexplore.Practices.Core
{
    using System;

    public interface IClock
    {
        DateTime Now { get; }
        DateTime UtcNow { get; }

        DateTimeOffset NowOffset { get; }
        DateTimeOffset UtcNowOffset { get; }

        DateOnly Today { get; }
        DateOnly UtcToday { get; }
    }
}
