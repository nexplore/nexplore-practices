# Configuration

You need to configure the database options in your `appsettings.json`

```
...

"Database": {
  "ConnectionString": "<Your Connection String>",
  "MappingConfigurationAssemblies": [
    "<Your Assembly Names>"
  ]
}

...
```

Alternatively you can also configure them static via code while building the `IWebHost`:

```
...
.ConfigureAppConfiguration(options =>
{
    options.AddInMemoryCollection(new Dictionary<string, string>
    {
        { "Database:MappingConfigurationAssemblies:0", "<Your Assembly Name>" }
    });
})
...
```

The following configurations are available:

- `ConnectionString`: Connection String to the database
- `MappingConfigurationAssemblies`: Array of assemblies with mapping configurations (assembly name)
- `MigrationAssembly`: Assembly name which contains migrations
- `ExecuteTestDataGenerators`: Boolean value whether test data generators should be executed
- `ExecuteSampleDataGenerators`: Boolean value whether sample data generators should be executed
- `AutoDetectChangesEnabled`: Boolean value whether ef automatic change detection is on or off, default: `true`
