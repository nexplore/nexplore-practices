namespace Nexplore.Practices.EntityFramework.Scopes
{
    using System;
    using System.Diagnostics.CodeAnalysis;
    using System.Threading;
    using System.Threading.Tasks;
    using Autofac;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Infrastructure;
    using Microsoft.EntityFrameworkCore.Storage;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core.Extensions;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.EntityFramework.Configuration;

    [SuppressMessage("StyleCop.CSharp.DocumentationRules", "SA1649:FileNameMustMatchTypeName", Justification = "UnitOfWorkFactoryBase follows the naming pattern and is best placed at the top of this file.")]
    public abstract class UnitOfWorkFactoryBase<TUnitOfWork, TUnitOfWorkWithSingleDbTransaction>
        where TUnitOfWork : IUnitOfWork
        where TUnitOfWorkWithSingleDbTransaction : IUnitOfWorkWithSingleDbTransaction
    {
        private readonly ILifetimeScope lifetimeScope;
        private readonly IOptions<DatabaseOptions> databaseOptions;

        protected UnitOfWorkFactoryBase(ILifetimeScope lifetimeScope, IOptions<DatabaseOptions> databaseOptions)
        {
            this.lifetimeScope = lifetimeScope;
            this.databaseOptions = databaseOptions;
        }

        public virtual TUnitOfWork Begin(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null)
        {
            ILifetimeScope childLifetimeScope = default(ILifetimeScope);
            DbContext dbContext = default(DbContext);
            IDbContextTransaction dbTransactionOfParentUnitOfWork = default(IDbContextTransaction);
            TUnitOfWork unitOfWork = default(TUnitOfWork);

            try
            {
                lifetimeScopeConfigurationAction = AutofacExtensions.AddRegistrationSources(
                    lifetimeScopeConfigurationAction,
                    new AutofacDbContextRegistrationSource(() => dbContext),
                    new AutofacChildScopeRegistrationSource(() => unitOfWork));

                childLifetimeScope = AutofacExtensions.BeginChildLifetimeScope(this.lifetimeScope, lifetimeScopeConfigurationAction);

                dbTransactionOfParentUnitOfWork = ResolveDbTransactionOfParentUnitOfWorkOrDefault(this.lifetimeScope);
                dbContext = this.CreateContext(childLifetimeScope, existingTransaction: dbTransactionOfParentUnitOfWork);

                unitOfWork = this.CreateUnitOfWork(dbContext, childLifetimeScope);

                return unitOfWork;
            }
            catch
            {
                dbContext?.Dispose();
                childLifetimeScope?.Dispose();

                throw;
            }
        }

        public virtual TUnitOfWorkWithSingleDbTransaction BeginWithSingleDbTransaction(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null)
        {
            ILifetimeScope childLifetimeScope = default;
            DbContext dbContext = default;
            IDbContextTransaction transaction = default;
            TUnitOfWorkWithSingleDbTransaction unitOfWork = default;

            try
            {
                lifetimeScopeConfigurationAction = AutofacExtensions.AddRegistrationSources(
                    lifetimeScopeConfigurationAction,
                    new AutofacDbContextRegistrationSource(() => dbContext),
                    new AutofacChildScopeRegistrationSource(() => unitOfWork));

                childLifetimeScope = AutofacExtensions.BeginChildLifetimeScope(this.lifetimeScope, lifetimeScopeConfigurationAction);

                dbContext = this.CreateContext(childLifetimeScope, existingTransaction: null);

                transaction = this.BeginTransaction(childLifetimeScope, dbContext);
                unitOfWork = this.CreateUnitOfWorkWithSingleDbTransaction(dbContext, transaction, childLifetimeScope);

                return unitOfWork;
            }
            catch
            {
                unitOfWork?.Dispose();
                transaction?.Dispose();
                dbContext?.Dispose();
                childLifetimeScope?.Dispose();

                throw;
            }
        }

        public virtual async Task<TUnitOfWorkWithSingleDbTransaction> BeginWithSingleDbTransactionAsync(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null, CancellationToken cancellationToken = default)
        {
            ILifetimeScope childLifetimeScope = default;
            DbContext dbContext = default;
            IDbContextTransaction transaction = default;
            TUnitOfWorkWithSingleDbTransaction unitOfWork = default;

            try
            {
                lifetimeScopeConfigurationAction = AutofacExtensions.AddRegistrationSources(
                    lifetimeScopeConfigurationAction,
                    new AutofacDbContextRegistrationSource(() => dbContext),
                    new AutofacChildScopeRegistrationSource(() => unitOfWork));

                childLifetimeScope = AutofacExtensions.BeginChildLifetimeScope(this.lifetimeScope, lifetimeScopeConfigurationAction);
                dbContext = this.CreateContext(childLifetimeScope, existingTransaction: null);

                transaction = await this.BeginTransactionAsync(childLifetimeScope, dbContext, cancellationToken).ConfigureAwait(false);
                unitOfWork = this.CreateUnitOfWorkWithSingleDbTransaction(dbContext, transaction, childLifetimeScope);

                return unitOfWork;
            }
            catch
            {
                unitOfWork?.Dispose();
                transaction?.Dispose();
                dbContext?.Dispose();
                childLifetimeScope?.Dispose();

                throw;
            }
        }

        protected virtual DbContext CreateContext(ILifetimeScope childLifetimeScope, IDbContextTransaction existingTransaction)
        {
            var dbContextFactory = childLifetimeScope.Resolve<IDbContextFactory>();
            var dbContext = dbContextFactory.Create(existingTransaction);
            return dbContext;
        }

        protected virtual IDbContextTransaction BeginTransaction(ILifetimeScope childLifetimeScope, DbContext dbContext)
        {
            var dbContextTransactionFactory = childLifetimeScope.Resolve<IDbContextTransactionFactory>();
            return dbContextTransactionFactory.BeginTransaction(dbContext);
        }

        protected virtual async Task<IDbContextTransaction> BeginTransactionAsync(ILifetimeScope childLifetimeScope, DbContext dbContext, CancellationToken cancellationToken)
        {
            var dbContextTransactionFactory = childLifetimeScope.Resolve<IDbContextTransactionFactory>();
            return await dbContextTransactionFactory.BeginTransactionAsync(dbContext, cancellationToken).ConfigureAwait(false);
        }

        protected abstract TUnitOfWork CreateUnitOfWork(DbContext context, ILifetimeScope lifetimeScope);

        protected abstract TUnitOfWorkWithSingleDbTransaction CreateUnitOfWorkWithSingleDbTransaction(DbContext context, IDbContextTransaction transaction, ILifetimeScope lifetimeScope);

        private static IDbContextTransaction ResolveDbTransactionOfParentUnitOfWorkOrDefault(ILifetimeScope parentLifetimeScope)
        {
            IDbContextTransaction transaction = null;

            var hasUnitOfWorkInParent = parentLifetimeScope.ResolveOptional<IUnitOfWork>() != null;
            if (hasUnitOfWorkInParent)
            {
                transaction = parentLifetimeScope.Resolve<DatabaseFacade>().CurrentTransaction;
            }

            return transaction;
        }
    }

    public class UnitOfWorkFactory<TDependent> : UnitOfWorkFactoryBase<IUnitOfWork<TDependent>, IUnitOfWorkWithSingleDbTransaction<TDependent>>, IUnitOfWorkFactory<TDependent>
    {
        public UnitOfWorkFactory(ILifetimeScope lifetimeScope, IOptions<DatabaseOptions> databaseOptions)
            : base(lifetimeScope, databaseOptions)
        {
        }

        protected override IUnitOfWork<TDependent> CreateUnitOfWork(DbContext context, ILifetimeScope lifetimeScope)
        {
            return new UnitOfWork<TDependent>(
                context,
                lifetimeScope,
                lifetimeScope.Resolve<Lazy<TDependent>>());
        }

        protected override IUnitOfWorkWithSingleDbTransaction<TDependent> CreateUnitOfWorkWithSingleDbTransaction(DbContext context, IDbContextTransaction transaction, ILifetimeScope lifetimeScope)
        {
            return new UnitOfWorkWithSingleDbTransaction<TDependent>(
                context,
                transaction,
                lifetimeScope,
                lifetimeScope.Resolve<Lazy<TDependent>>());
        }
    }

    public class UnitOfWorkFactory<TDependent, TDependent2> : UnitOfWorkFactoryBase<IUnitOfWork<TDependent, TDependent2>, IUnitOfWorkWithSingleDbTransaction<TDependent, TDependent2>>, IUnitOfWorkFactory<TDependent, TDependent2>
    {
        public UnitOfWorkFactory(ILifetimeScope lifetimeScope, IOptions<DatabaseOptions> databaseOptions)
            : base(lifetimeScope, databaseOptions)
        {
        }

        protected override IUnitOfWork<TDependent, TDependent2> CreateUnitOfWork(DbContext context, ILifetimeScope lifetimeScope)
        {
            return new UnitOfWork<TDependent, TDependent2>(
                context,
                lifetimeScope,
                lifetimeScope.Resolve<Lazy<TDependent>>(),
                lifetimeScope.Resolve<Lazy<TDependent2>>());
        }

        protected override IUnitOfWorkWithSingleDbTransaction<TDependent, TDependent2> CreateUnitOfWorkWithSingleDbTransaction(DbContext context, IDbContextTransaction transaction, ILifetimeScope lifetimeScope)
        {
            return new UnitOfWorkWithSingleDbTransaction<TDependent, TDependent2>(
                context,
                transaction,
                lifetimeScope,
                lifetimeScope.Resolve<Lazy<TDependent>>(),
                lifetimeScope.Resolve<Lazy<TDependent2>>());
        }
    }

    public class UnitOfWorkFactory<TDependent, TDependent2, TDependent3> : UnitOfWorkFactoryBase<IUnitOfWork<TDependent, TDependent2, TDependent3>, IUnitOfWorkWithSingleDbTransaction<TDependent, TDependent2, TDependent3>>, IUnitOfWorkFactory<TDependent, TDependent2, TDependent3>
    {
        public UnitOfWorkFactory(ILifetimeScope lifetimeScope, IOptions<DatabaseOptions> databaseOptions)
            : base(lifetimeScope, databaseOptions)
        {
        }

        protected override IUnitOfWork<TDependent, TDependent2, TDependent3> CreateUnitOfWork(DbContext context, ILifetimeScope lifetimeScope)
        {
            return new UnitOfWork<TDependent, TDependent2, TDependent3>(
                context,
                lifetimeScope,
                lifetimeScope.Resolve<Lazy<TDependent>>(),
                lifetimeScope.Resolve<Lazy<TDependent2>>(),
                lifetimeScope.Resolve<Lazy<TDependent3>>());
        }

        protected override IUnitOfWorkWithSingleDbTransaction<TDependent, TDependent2, TDependent3> CreateUnitOfWorkWithSingleDbTransaction(DbContext context, IDbContextTransaction transaction, ILifetimeScope lifetimeScope)
        {
            return new UnitOfWorkWithSingleDbTransaction<TDependent, TDependent2, TDependent3>(
                context,
                transaction,
                lifetimeScope,
                lifetimeScope.Resolve<Lazy<TDependent>>(),
                lifetimeScope.Resolve<Lazy<TDependent2>>(),
                lifetimeScope.Resolve<Lazy<TDependent3>>());
        }
    }
}
