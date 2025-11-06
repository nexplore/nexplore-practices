namespace Nexplore.Practices.EntityFramework.Services
{
    using System;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Infrastructure;
    using Nexplore.Practices.Core.Services;

    public class DbTimeoutService : IDbTimeoutService
    {
        private const int LARGE_COMMAND_TIMEOUT_IN_SECONDS = 15 * 60;

        private readonly DatabaseFacade databaseFacade;
        private readonly int? defaultCommandTimeout;

        public DbTimeoutService(DatabaseFacade databaseFacade)
        {
            this.databaseFacade = databaseFacade;
            this.defaultCommandTimeout = databaseFacade.GetCommandTimeout();
        }

        public IDisposable UseLargeCommandTimeout()
        {
            return this.UseCommandTimeout(LARGE_COMMAND_TIMEOUT_IN_SECONDS);
        }

        public IDisposable UseCommandTimeout(int timeoutInSeconds)
        {
            if (this.databaseFacade.GetCommandTimeout() != this.defaultCommandTimeout)
            {
                throw new InvalidOperationException("Custom command timeout already set.");
            }

            this.databaseFacade.SetCommandTimeout(TimeSpan.FromSeconds(timeoutInSeconds));
            return new Timeout(this);
        }

        private void RestoreCommandTimeout()
        {
            this.databaseFacade.SetCommandTimeout(this.defaultCommandTimeout);
        }

        private class Timeout : IDisposable
        {
            private readonly DbTimeoutService timeoutService;
            private bool isDisposed;

            public Timeout(DbTimeoutService timeoutService)
            {
                this.timeoutService = timeoutService;
            }

            public void Dispose()
            {
                if (!this.isDisposed)
                {
                    this.isDisposed = true;
                    this.timeoutService.RestoreCommandTimeout();
                }
            }
        }
    }
}
