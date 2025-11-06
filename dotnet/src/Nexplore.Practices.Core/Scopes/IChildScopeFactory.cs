namespace Nexplore.Practices.Core.Scopes
{
    using System;
    using Autofac;

    /// <summary>
    /// Factory to begin new child scope.
    /// </summary>
    /// <typeparam name="TDependent">Type of the root dependency to work with in this scope.</typeparam>
    public interface IChildScopeFactory<TDependent>
    {
        /// <summary>
        /// Begins a child scope of the current lifetime scope and encapsulates this to one scope.
        /// </summary>
        /// <param name="lifetimeScopeConfigurationAction">Action to configure lifetime scope specific dependencies.</param>
        /// <returns>Returns the began child scope.</returns>
        IChildScope<TDependent> Begin(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null);
    }

    /// <summary>
    /// Factory to begin new child scope.
    /// </summary>
    /// <typeparam name="TDependent">Type of the first root dependency to work with in this scope.</typeparam>
    /// <typeparam name="TDependent2">Type of the second root dependency to work with in this scope.</typeparam>
    public interface IChildScopeFactory<TDependent, TDependent2>
    {
        /// <inheritdoc cref="IChildScopeFactory{TDependent}.Begin"/>
        IChildScope<TDependent, TDependent2> Begin(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null);
    }

    /// <summary>
    /// Factory to begin new child scope.
    /// </summary>
    /// <typeparam name="TDependent">Type of the first root dependency to work with in this scope.</typeparam>
    /// <typeparam name="TDependent2">Type of the second root dependency to work with in this scope.</typeparam>
    /// <typeparam name="TDependent3">Type of the third root dependency to work with in this scope.</typeparam>
    public interface IChildScopeFactory<TDependent, TDependent2, TDependent3>
    {
        /// <inheritdoc cref="IChildScopeFactory{TDependent}.Begin"/>
        IChildScope<TDependent, TDependent2, TDependent3> Begin(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null);
    }
}
