namespace Nexplore.Practices.Core.Scopes
{
    using System;
    using Autofac;

    public class ChildScope : IChildScope
    {
        private readonly ILifetimeScope lifetimeScope;
        private bool isDisposed;

        public ChildScope(ILifetimeScope lifetimeScope)
        {
            this.lifetimeScope = lifetimeScope;
        }

        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool isDisposing)
        {
            if (isDisposing && !this.isDisposed)
            {
                this.isDisposed = true;
                this.lifetimeScope.Dispose();
            }
        }
    }

    public class ChildScope<TDependent> : ChildScope, IChildScope<TDependent>
    {
        private readonly Lazy<TDependent> dependent;

        public ChildScope(ILifetimeScope lifetimeScope, Lazy<TDependent> dependent)
            : base(lifetimeScope)
        {
            this.dependent = dependent;
        }

        public TDependent Dependent => this.dependent.Value;
    }

    public class ChildScope<TDependent, TDependent2> : ChildScope<TDependent>, IChildScope<TDependent, TDependent2>
    {
        private readonly Lazy<TDependent2> dependent2;

        public ChildScope(ILifetimeScope lifetimeScope, Lazy<TDependent> dependent, Lazy<TDependent2> dependent2)
            : base(lifetimeScope, dependent)
        {
            this.dependent2 = dependent2;
        }

        public TDependent2 Dependent2 => this.dependent2.Value;
    }

    public class ChildScope<TDependent, TDependent2, TDependent3> : ChildScope<TDependent, TDependent2>, IChildScope<TDependent, TDependent2, TDependent3>
    {
        private readonly Lazy<TDependent3> dependent3;

        public ChildScope(ILifetimeScope lifetimeScope, Lazy<TDependent> dependent, Lazy<TDependent2> dependent2, Lazy<TDependent3> dependent3)
            : base(lifetimeScope, dependent, dependent2)
        {
            this.dependent3 = dependent3;
        }

        public TDependent3 Dependent3 => this.dependent3.Value;
    }
}
