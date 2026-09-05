# Installation

To correctly initialize the library you need to register the module in your Autofac Container Builder.  
Further you need to register your implementation of `IDbManagementService` in your Autofac Container Builder.

```csharp
...

// Command line commands and options
builder.RegisterModule<Nexplore.Practices.CommandLine.Database.Registry>();

// Services
builder.RegisterType<DbManagementService>().As<IDbManagementService>().InstancePerLifetimeScope();

...
```
