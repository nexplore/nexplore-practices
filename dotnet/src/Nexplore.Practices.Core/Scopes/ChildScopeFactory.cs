namespace Nexplore.Practices.Core.Scopes
{
    using System;
    using System.Diagnostics.CodeAnalysis;
    using Autofac;
    using Nexplore.Practices.Core.Extensions;

    [SuppressMessage("StyleCop.CSharp.DocumentationRules", "SA1649:FileNameMustMatchTypeName", Justification = "ChildScopeFactoryBase follows the naming pattern and is best placed at the top of this file.")]
    public abstract class ChildScopeFactoryBase<TChildScope>
        where TChildScope : IChildScope
    {
        private readonly ILifetimeScope lifetimeScope;

        protected ChildScopeFactoryBase(ILifetimeScope lifetimeScope)
        {
            this.lifetimeScope = lifetimeScope;
        }

        public TChildScope Begin(Action<ContainerBuilder> lifetimeScopeConfigurationAction = null)
        {
            var childLifetimeScope = default(ILifetimeScope);
            var childScope = default(TChildScope);

            try
            {
                lifetimeScopeConfigurationAction = AutofacExtensions.AddRegistrationSources(
                    lifetimeScopeConfigurationAction,
                    new AutofacChildScopeRegistrationSource(() => childScope));

                childLifetimeScope = AutofacExtensions.BeginChildLifetimeScope(this.lifetimeScope, lifetimeScopeConfigurationAction);

                childScope = this.CreateChildScope(childLifetimeScope);

                return childScope;
            }
            catch
            {
                childLifetimeScope?.Dispose();

                throw;
            }
        }

        protected abstract TChildScope CreateChildScope(ILifetimeScope lifetimeScope);
    }

    public class ChildScopeFactory<TDependent> : ChildScopeFactoryBase<IChildScope<TDependent>>, IChildScopeFactory<TDependent>
    {
        public ChildScopeFactory(ILifetimeScope lifetimeScope)
            : base(lifetimeScope)
        {
        }

        protected override IChildScope<TDependent> CreateChildScope(ILifetimeScope lifetimeScope)
        {
            return new ChildScope<TDependent>(
                lifetimeScope,
                lifetimeScope.Resolve<Lazy<TDependent>>());
        }
    }

    public class ChildScopeFactory<TDependent, TDependent2> : ChildScopeFactoryBase<IChildScope<TDependent, TDependent2>>, IChildScopeFactory<TDependent, TDependent2>
    {
        public ChildScopeFactory(ILifetimeScope lifetimeScope)
            : base(lifetimeScope)
        {
        }

        protected override IChildScope<TDependent, TDependent2> CreateChildScope(ILifetimeScope lifetimeScope)
        {
            return new ChildScope<TDependent, TDependent2>(
                lifetimeScope,
                lifetimeScope.Resolve<Lazy<TDependent>>(),
                lifetimeScope.Resolve<Lazy<TDependent2>>());
        }
    }

    public class ChildScopeFactory<TDependent, TDependent2, TDependent3> : ChildScopeFactoryBase<IChildScope<TDependent, TDependent2, TDependent3>>, IChildScopeFactory<TDependent, TDependent2, TDependent3>
    {
        public ChildScopeFactory(ILifetimeScope lifetimeScope)
            : base(lifetimeScope)
        {
        }

        protected override IChildScope<TDependent, TDependent2, TDependent3> CreateChildScope(ILifetimeScope lifetimeScope)
        {
            return new ChildScope<TDependent, TDependent2, TDependent3>(
                lifetimeScope,
                lifetimeScope.Resolve<Lazy<TDependent>>(),
                lifetimeScope.Resolve<Lazy<TDependent2>>(),
                lifetimeScope.Resolve<Lazy<TDependent3>>());
        }
    }
}
