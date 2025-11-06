# Installation

To correctly initialize the library you need to register the module in your Autofac Container Builder:

```csharp
...

builder.RegisterModule<Practices.Syncfusion.Excel.Registry>();

...
```

## Configuration

This package uses the Syncfusion Library to handle Excel files. Make sure that your project has a valid licence key and is registered correctly. More Information about Syncfusion Licencing can be found [here](https://apps.nexplore.ch/docs/development-practices/best-practices/pdf-library).

For More Information about this package or example usage refer to the [README](../../Backend/src/Nexplore.Practices.Syncfusion.Excel/README.md)
