namespace Nexplore.Practices.EntityFramework.Scopes
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Autofac;
    using Microsoft.EntityFrameworkCore;
    using Nexplore.Practices.Core.Scopes;

    public class UnitOfWork : IUnitOfWork
    {
        private readonly DbContext context;
        private readonly ILifetimeScope lifetimeScope;
        private bool isDisposed;

        public UnitOfWork(DbContext context, ILifetimeScope lifetimeScope)
        {
            this.context = context;
            this.lifetimeScope = lifetimeScope;
        }

        public void SaveChanges()
        {
            this.context.SaveChanges();
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            return this.context.SaveChangesAsync(cancellationToken);
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
                this.context.Dispose();
                this.lifetimeScope.Dispose();
            }
        }
    }

    public class UnitOfWork<TDependent> : UnitOfWork, IUnitOfWork<TDependent>
    {
        private readonly Lazy<TDependent> dependent;

        public UnitOfWork(DbContext context, ILifetimeScope lifetimeScope, Lazy<TDependent> dependent)
            : base(context, lifetimeScope)
        {
            this.dependent = dependent;
        }

        public TDependent Dependent => this.dependent.Value;
    }

    public class UnitOfWork<TDependent, TDependent2> : UnitOfWork<TDependent>, IUnitOfWork<TDependent, TDependent2>
    {
        private readonly Lazy<TDependent2> dependent2;

        public UnitOfWork(DbContext context, ILifetimeScope lifetimeScope, Lazy<TDependent> dependent, Lazy<TDependent2> dependent2)
            : base(context, lifetimeScope, dependent)
        {
            this.dependent2 = dependent2;
        }

        public TDependent2 Dependent2 => this.dependent2.Value;
    }

    public class UnitOfWork<TDependent, TDependent2, TDependent3> : UnitOfWork<TDependent, TDependent2>, IUnitOfWork<TDependent, TDependent2, TDependent3>
    {
        private readonly Lazy<TDependent3> dependent3;

        public UnitOfWork(DbContext context, ILifetimeScope lifetimeScope, Lazy<TDependent> dependent, Lazy<TDependent2> dependent2, Lazy<TDependent3> dependent3)
            : base(context, lifetimeScope, dependent, dependent2)
        {
            this.dependent3 = dependent3;
        }

        public TDependent3 Dependent3 => this.dependent3.Value;
    }
}
