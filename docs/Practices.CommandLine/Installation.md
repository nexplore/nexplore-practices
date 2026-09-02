# Installation

To correctly initialize the library you need to register the module in your Autofac Container Builder:

```csharp
...

builder.RegisterModule<Practices.CommandLine.Registry>();

...
```
