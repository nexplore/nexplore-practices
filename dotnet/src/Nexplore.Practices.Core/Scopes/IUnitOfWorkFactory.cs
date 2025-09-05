namespace Nexplore.Practices.Core.Scopes
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Autofac;

    /// <summary>
    /// Factory to begin new unit of works.
    /// </summary>
    /// <typeparam name="TDependent">Type of the root dependency to work with in this unit.</typeparam>
    public interface IUnitOfWorkFactory<TDependent>
    {
        /// <summary>
        /// Begins a child scope of the current lifetime scope, creates a database context and encapsulates this to one unit to work in.
        /// </summary>
        /// <param name="lifetimeScopeConfigurationAction">Action to configure lifetime scope specific dependencies.</param>
        /// <returns>Returns the began unit of work.</returns>
        IUnitOfWork<TDependent> Begin(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null);

        /// <summary>
        /// Begins a child scope of the current lifetime scope, creates a database context, starts a single transaction for accesses
        /// to the database and encapsulates this to one unit to work in.
        /// </summary>
        /// <param name="lifetimeScopeConfigurationAction">Action to configure lifetime scope specific dependencies.</param>
        /// <returns>Returns the began unit of work.</returns>
        IUnitOfWorkWithSingleDbTransaction<TDependent> BeginWithSingleDbTransaction(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null);

        /// <summary>
        /// Begins a child scope of the current lifetime scope, creates a database context, starts a single transaction for accesses
        /// to the database and encapsulates this to one unit to work in.
        /// </summary>
        /// <param name="lifetimeScopeConfigurationAction">Action to configure lifetime scope specific dependencies.</param>
        /// <param name="cancellationToken">Cancellation token to cancel the operation.</param>
        /// <returns>Returns the began unit of work.</returns>
        Task<IUnitOfWorkWithSingleDbTransaction<TDependent>> BeginWithSingleDbTransactionAsync(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Factory to begin new unit of works.
    /// </summary>
    /// <typeparam name="TDependent">Type of the first root dependency to work with in this unit.</typeparam>
    /// <typeparam name="TDependent2">Type of the second root dependency to work with in this unit.</typeparam>
    public interface IUnitOfWorkFactory<TDependent, TDependent2>
    {
        /// <inheritdoc cref="IUnitOfWorkFactory{TDependent}.Begin"/>
        IUnitOfWork<TDependent, TDependent2> Begin(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null);

        /// <inheritdoc cref="IUnitOfWorkFactory{TDependent}.BeginWithSingleDbTransaction"/>
        IUnitOfWorkWithSingleDbTransaction<TDependent, TDependent2> BeginWithSingleDbTransaction(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null);

        // <inheritdoc cref="IUnitOfWorkFactory{TDependent}.BeginWithSingleDbTransactionAsync"/>
        Task<IUnitOfWorkWithSingleDbTransaction<TDependent, TDependent2>> BeginWithSingleDbTransactionAsync(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Factory to begin new unit of works.
    /// </summary>
    /// <typeparam name="TDependent">Type of the first root dependency to work with in this unit.</typeparam>
    /// <typeparam name="TDependent2">Type of the second root dependency to work with in this unit.</typeparam>
    /// <typeparam name="TDependent3">Type of the third root dependency to work with in this unit.</typeparam>
    public interface IUnitOfWorkFactory<TDependent, TDependent2, TDependent3>
    {
        /// <inheritdoc cref="IUnitOfWorkFactory{TDependent}.Begin"/>
        IUnitOfWork<TDependent, TDependent2, TDependent3> Begin(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null);

        /// <inheritdoc cref="IUnitOfWorkFactory{TDependent}.BeginWithSingleDbTransaction"/>
        IUnitOfWorkWithSingleDbTransaction<TDependent, TDependent2, TDependent3> BeginWithSingleDbTransaction(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null);

        // <inheritdoc cref="IUnitOfWorkFactory{TDependent}.BeginWithSingleDbTransactionAsync"/>
        Task<IUnitOfWorkWithSingleDbTransaction<TDependent, TDependent2, TDependent3>> BeginWithSingleDbTransactionAsync(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null, CancellationToken cancellationToken = default);
    }
}
