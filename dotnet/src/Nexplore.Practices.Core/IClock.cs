namespace Nexplore.Practices.Core
{
    using System;

    public interface IClock
    {
        DateTime Now { get; }

        DateTime UtcNow { get; }

        DateTime Today { get; }

        DateTime UtcToday { get; }
    }
}
