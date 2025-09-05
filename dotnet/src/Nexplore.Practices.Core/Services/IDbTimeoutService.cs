namespace Nexplore.Practices.Core.Services
{
    using System;

    public interface IDbTimeoutService
    {
        /// <summary>
        /// Use a database command timeout of 15 minutes.
        /// </summary>
        /// <returns>Disposable object to reset the timeout to it's initial value.</returns>
        IDisposable UseLargeCommandTimeout();

        /// <summary>
        /// Set a custom database command timeout.
        /// </summary>
        /// <param name="timeoutInSeconds">The timeout to use in seconds.</param>
        /// <returns>Disposable object to reset the timeout to it's initial value.</returns>
        IDisposable UseCommandTimeout(int timeoutInSeconds);
    }
}
