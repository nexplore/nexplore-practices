namespace Nexplore.Practices.Core
{
    using System;

    public static class Disposable
    {
        public static IDisposable Empty { get; } = new EmptyDisposable();

        public static IDisposable Create(Action disposeAction)
        {
            return new AnonymousDisposable(disposeAction);
        }
    }

    internal class AnonymousDisposable : IDisposable
    {
        private readonly Action disposeAction;

        public AnonymousDisposable(Action disposeAction)
        {
            this.disposeAction = disposeAction;
        }

        public void Dispose()
        {
            this.disposeAction();
        }
    }

    internal class EmptyDisposable : IDisposable
    {
        public void Dispose()
        {
        }
    }
}
