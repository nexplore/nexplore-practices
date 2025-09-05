# Installation

To correctly initialize the library you need to register the module in your Autofac Container Builder:

```csharp
...

builder.RegisterModule<Practices.File.Registry>();

...
```

## Configuration

You can configure the library in your `appsettings.json` under the following node:

```
...

"File": {
  ...
}

...
```

### Additional Mime Type Mappings

If you need to configure additional mime type mappings, you can add them in the property `AdditionalMimeTypeMappings`:

```
...

"File": {
  "AdditionalMimeTypeMappings": {
       ".msg": "application/vnd.ms-outlook",
       ".custom": "application/my-custom"
  }
}

...
```
