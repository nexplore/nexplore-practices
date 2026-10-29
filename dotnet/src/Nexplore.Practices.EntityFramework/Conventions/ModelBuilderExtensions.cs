namespace Nexplore.Practices.EntityFramework.Conventions
{
    using System.Reflection;
    using Microsoft.EntityFrameworkCore;

    public static class ModelBuilderExtensions
    {
        public static void ApplyConfigurationsFromAssemblies(this ModelBuilder modelBuilder, string[] assemblyPaths)
        {
            if (assemblyPaths == null || assemblyPaths.Length == 0)
            {
                return;
            }

            foreach (var assemblyName in assemblyPaths)
            {
                var assembly = Assembly.Load(assemblyName);
                modelBuilder.ApplyConfigurationsFromAssembly(assembly);
            }
        }

        public static void ApplyDefaultSchema(this ModelBuilder modelBuilder, string schema)
        {
            modelBuilder.HasDefaultSchema(schema);
        }
    }
}
