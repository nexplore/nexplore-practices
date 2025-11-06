namespace Nexplore.Practices.Core.Generators
{
    using System;

    [AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
    public class GeneratorDependencyAttribute : Attribute
    {
        public GeneratorDependencyAttribute(Type generatorType)
        {
            Guard.TypeIsAssignable(typeof(IGenerator), generatorType, "generatorType");

            this.GeneratorType = generatorType;
        }

        public Type GeneratorType { get; }
    }
}
