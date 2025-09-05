namespace Nexplore.Practices.Core.Generators
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    public interface IGeneratorRunner
    {
        Task RunGeneratorAsync<TGenerator>(CancellationToken cancellationToken = default)
            where TGenerator : IGenerator;

        Task RunGeneratorsAsync(IEnumerable<Type> generatorTypes, CancellationToken cancellationToken = default);

        Task RunGeneratorsAsync<TGenerator>(CancellationToken cancellationToken = default)
            where TGenerator : IGenerator;
    }
}
