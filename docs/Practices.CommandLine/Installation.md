# Installation

To correctly initialize the library you need to register the module in your Autofac Container Builder:

```csharp
...

// Command line commands and options
builder.RegisterModule<Nexplore.Practices.CommandLine.Registry>();

...
```

To override the default CLI description set the static `CliDescription` property on `CliCommandInvoker`.  
Make sure to override the description before the DI container is built or before the first resolve of any CLI object respectively. Otherwise the description will not be taken into account.

```csharp
...

CliCommandInvoker.CliDescription = "My CLI description";

...
```
