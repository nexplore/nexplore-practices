namespace Nexplore.Practices.Core.Scopes
{
    using System;

    /// <summary>
    /// Unites a lifetime scope to one encapsulated scope.
    /// </summary>
    public interface IChildScope : IDisposable
    {
    }

    /// <inheritdoc cref="IChildScope" />
    public interface IChildScope<out TDependent> : IChildScope
    {
        TDependent Dependent { get; }
    }

    /// <inheritdoc cref="IChildScope" />
    public interface IChildScope<out TDependent1, out TDependent2> : IChildScope<TDependent1>
    {
        TDependent2 Dependent2 { get; }
    }

    /// <inheritdoc cref="IChildScope" />
    public interface IChildScope<out TDependent1, out TDependent2, out TDependent3> : IChildScope<TDependent1, TDependent2>
    {
        TDependent3 Dependent3 { get; }
    }
}
