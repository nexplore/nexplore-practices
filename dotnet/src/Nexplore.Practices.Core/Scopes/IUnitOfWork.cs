namespace Nexplore.Practices.Core.Scopes
{
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Unites a lifetime scope and a database context to one encapsulated unit to work in.
    /// </summary>
    public interface IUnitOfWork : IChildScope
    {
        void SaveChanges();

        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }

    /// <inheritdoc cref="IUnitOfWork" />
    public interface IUnitOfWork<out TDependent> : IUnitOfWork, IChildScope<TDependent>
    {
    }

    /// <inheritdoc cref="IUnitOfWork" />
    public interface IUnitOfWork<out TDependent1, out TDependent2> : IUnitOfWork<TDependent1>, IChildScope<TDependent1, TDependent2>
    {
    }

    /// <inheritdoc cref="IUnitOfWork" />
    public interface IUnitOfWork<out TDependent1, out TDependent2, out TDependent3> : IUnitOfWork<TDependent1, TDependent2>, IChildScope<TDependent1, TDependent2, TDependent3>
    {
    }
}
