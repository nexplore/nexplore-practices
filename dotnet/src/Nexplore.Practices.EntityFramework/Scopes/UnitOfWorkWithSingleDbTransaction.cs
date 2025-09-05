namespace Nexplore.Practices.EntityFramework.Scopes
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Autofac;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Storage;
    using Nexplore.Practices.Core.Scopes;

    public class UnitOfWorkWithSingleDbTransaction<TDependent> : UnitOfWork<TDependent>, IUnitOfWorkWithSingleDbTransaction<TDependent>
    {
        private readonly IDbContextTransaction transaction;
        private bool isDisposed;

        public UnitOfWorkWithSingleDbTransaction(DbContext context, IDbContextTransaction transaction, ILifetimeScope lifetimeScope, Lazy<TDependent> dependent)
            : base(context, lifetimeScope, dependent)
        {
            this.transaction = transaction;
        }

        public void CommitDbTransaction()
        {
            this.transaction.Commit();
        }

        public async Task CommitDbTransactionAsync(CancellationToken cancellationToken)
        {
            await this.transaction.CommitAsync(cancellationToken).ConfigureAwait(false);
        }

        protected override void Dispose(bool isDisposing)
        {
            if (isDisposing && !this.isDisposed)
            {
                this.isDisposed = true;
                this.transaction.Dispose();
            }

            base.Dispose(isDisposing);
        }
    }

    public class UnitOfWorkWithSingleDbTransaction<TDependent, TDependent2> : UnitOfWorkWithSingleDbTransaction<TDependent>, IUnitOfWorkWithSingleDbTransaction<TDependent, TDependent2>
    {
        private readonly Lazy<TDependent2> dependent2;

        public UnitOfWorkWithSingleDbTransaction(DbContext context, IDbContextTransaction transaction, ILifetimeScope lifetimeScope, Lazy<TDependent> dependent, Lazy<TDependent2> dependent2)
            : base(context, transaction, lifetimeScope, dependent)
        {
            this.dependent2 = dependent2;
        }

        public TDependent2 Dependent2 => this.dependent2.Value;
    }

    public class UnitOfWorkWithSingleDbTransaction<TDependent, TDependent2, TDependent3> : UnitOfWorkWithSingleDbTransaction<TDependent, TDependent2>, IUnitOfWorkWithSingleDbTransaction<TDependent, TDependent2, TDependent3>
    {
        private readonly Lazy<TDependent3> dependent3;

        public UnitOfWorkWithSingleDbTransaction(DbContext context, IDbContextTransaction transaction, ILifetimeScope lifetimeScope, Lazy<TDependent> dependent, Lazy<TDependent2> dependent2, Lazy<TDependent3> dependent3)
            : base(context, transaction, lifetimeScope, dependent, dependent2)
        {
            this.dependent3 = dependent3;
        }

        public TDependent3 Dependent3 => this.dependent3.Value;
    }
}
