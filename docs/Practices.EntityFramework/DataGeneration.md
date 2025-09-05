# Data Generation

Practices has functionality to seed the database with data (e.g. master data).

## Working with Generators

If you want to seed some data you first need to implement a generator (`IMasterDataGenerator`, `ISampleDataGenerator` or `ITestDataGenerator`), which provides you with the method `Generate()`. All generators are dependency injection aware (you can use constructor injection) and need to be registered within your project's registry. You can register all generators available with the following registration:

```csharp
builder.RegisterAssemblyTypes(typeof(Registry).Assembly)
    .Where(t => t.IsAssignableTo<IGenerator>())
    .AsImplementedInterfaces()
    .AsSelf()
    .InstancePerLifetimeScope();
```

After that, you can add every generator with the `GeneratorDependencyAttribute` to your Entity Framework migrations:

```csharp
[GeneratorDependency(typeof(SampleGenerator))]
public partial class Initial : Migration
{
    ...
}
```

You can add multiple generators on a migration and you can add dependent generators by adding the same attribute to a generator itself.

## Generator Types

There are three types of generators available, depending on your need.

### Master Data Generator

The `IMasterDataGenerator` should be used for all kind of application or master data which should always be available. These are executed on every environment as well as for integration tests.

### Sample Data Generator

The `ISampleDataGenerator` should be used for sample data (e.g. some test users) and should only be executed on testing environments. By default, this type of generators is ignored, but you can enable them via `DatabaseOptions.ExecuteSampleDataGenerators`.

### Test Data Generator

The `ITestDataGenerator` should be used for test data which will be used for integration tests. By default, this type of generators is ignored, but you can enable them via `DatabaseOptions.ExecuteTestDataGenerators`.

## Configuration

Before using generators, make sure that you have carefully read the following chapters.

### Generator Execution

Generators are automatically executed when migrating the database via `IMigrationService.MigrateDatabaseToLatestVersion()`, which will be used for deployments and integration tests. Unfortunately they aren't when using the Package Manager Console with `Update-Database`.

To enable generators for local environments as well, you need to add the following code into your `Program.cs`:

```csharp
#if DEBUG
    host.Services.GetService<IDataSeedingService>().Execute();
#endif
```

After this, all pending generators will be run during the next appliation start.

### Migration History

To remember pending generators we add a custom column to the migration history table from Entity Framework. By default, Entity Framework creates the migration history table on it's own, but after changing the mapping for the custom column, a newly created migration with `Add-Migration` tries to add the migration history table again, which results in an error.

As a result, you need to manually remove the creation of the migration history table of your migration. Entity Framework will do that automatically for your and you are fine.
