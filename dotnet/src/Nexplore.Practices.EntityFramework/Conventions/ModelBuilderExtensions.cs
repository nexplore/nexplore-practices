namespace Nexplore.Practices.EntityFramework.Conventions
{
    using System;
    using System.Linq;
    using Microsoft.EntityFrameworkCore;

    public static class ModelBuilderExtensions
    {
        public static void ApplyConfigurationsFromAssemblies(this ModelBuilder modelBuilder, string[] assemblyPaths)
        {
            if (assemblyPaths == null || assemblyPaths.Length == 0)
            {
                return;
            }

            var allAssemblies = AppDomain.CurrentDomain.GetAssemblies();
            foreach (var assemblyName in assemblyPaths)
            {
                var assembly = allAssemblies.Single(e => e.GetName().Name == assemblyName);
                modelBuilder.ApplyConfigurationsFromAssembly(assembly);
            }
        }

        public static void ApplyDefaultSchema(this ModelBuilder modelBuilder, string schema)
        {
            modelBuilder.HasDefaultSchema(schema);
        }
    }
}
