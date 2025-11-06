namespace Nexplore.Practices.Core.Scopes
{
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Unites a lifetime scope, a database context and one single long running database transaction to one encapsulated unit to work in.
    /// </summary>
    public interface IUnitOfWorkWithSingleDbTransaction : IUnitOfWork
    {
        void CommitDbTransaction();

        Task CommitDbTransactionAsync(CancellationToken cancellationToken = default);
    }

    /// <inheritdoc cref="IUnitOfWorkWithSingleDbTransaction" />
    public interface IUnitOfWorkWithSingleDbTransaction<out TDependent> : IUnitOfWork<TDependent>, IUnitOfWorkWithSingleDbTransaction
    {
    }

    /// <inheritdoc cref="IUnitOfWorkWithSingleDbTransaction" />
    public interface IUnitOfWorkWithSingleDbTransaction<out TDependent1, out TDependent2> : IUnitOfWork<TDependent1, TDependent2>, IUnitOfWorkWithSingleDbTransaction<TDependent1>
    {
    }

    /// <inheritdoc cref="IUnitOfWorkWithSingleDbTransaction" />
    public interface IUnitOfWorkWithSingleDbTransaction<out TDependent1, out TDependent2, out TDependent3> : IUnitOfWork<TDependent1, TDependent2, TDependent3>, IUnitOfWorkWithSingleDbTransaction<TDependent1, TDependent2>
    {
    }
}
