# Installation

To correctly initialize the library you need to register your implementation of `IDbManagementService` in your Autofac Container Builder:

```csharp
...

builder.RegisterType<DbManagementService>().As<IDbManagementService>().InstancePerLifetimeScope();

...
```
