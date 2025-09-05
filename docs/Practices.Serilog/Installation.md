# Installation

To correctly initialize the library you need to register the module in your Autofac Container Builder:

```csharp
...

builder.RegisterModule<Practices.Serilog.Registry>();

...
```

## Activation

To build the logger with the correct configuration and all its enrichers, as well as to close and flush it in the end, the following code should be added to the Main method:

```csharp
public static int Main(string[] args)
{
    ILoggerBuilder loggerBuilder = null;
    ...

    try
    {
        ...
    
        loggerBuilder = host.Services.GetRequiredService<ILoggerBuilder>();
        loggerBuilder.BuildLogger();
        
        ...
    }

    ...

    finally
    {
        loggerBuilder?.CloseAndFlush();
    }
}
```

## Sinks

There are plenty of sinks available for Serilog; the list can be found [here](https://github.com/serilog/serilog/wiki/Provided-Sinks).

These sinks are not part of the package and have to be added via NuGet for every project. The references should be added to the project(s) where the LoggerBuilder is called.


## Sample configuration

The following fragment contains a sample logger configuration using 4 different sinks. Furthermore, the log levels of some system libraries are overridden, so e.g. ASPNetCore or EF Core don't pollute our logs.
The configuration goes to the appsettings.json file.

```js
...
"Serilog": {
  "WriteTo": [	// Configure the sinks -> the NuGet packages containing these sinks need to be included in the project containing the logger configuration
    {
      "Name": "File",
      "Args": {
        "path": "logs\\myproject-web-.log",
        "rollingInterval": "Day",
        "shared": true,
        "outputTemplate": "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] ProcessId: {ProcessId} - CorrelationId: {CorrelationId} - UserId: {UserId} - {Message:lj}{NewLine}{Exception}"
      }
    },
    {
      "Name": "Udp",
      "Args": {
        "remoteAddress": "localhost",
        "remotePort": 7071,
        "family": "InterNetwork",
        "formatter": "Serilog.Sinks.Udp.TextFormatters.Log4jTextFormatter, Serilog.Sinks.Udp, Version=6.0.0.0, Culture=neutral, PublicKeyToken=24c2f752a8e58a10"
      }
    },
    {
      "Name": "Elasticsearch",
      "Args": {
        "nodeUris": "https://elastic.nexplore.ch:9200/",
        "indexFormat": "myproject-index",
        "templateName": "NxSerilogTemplate",
        "autoRegisterTemplate": true,
        "autoRegisterTemplateVersion": "ESv2"
      }
    },
    {
      "Name": "Console",
      "Args": {
        "outputTemplate": "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] -- {Message:lj}{NewLine}{Exception}"
      }
    }
  ],
  "MinimumLevel": {
    "Default": "Information", //Default log level, applies for all namespaces not overridden below
    "Override": {
      "System": "Warning",
      "Microsoft": "Warning"
    }
  }
}
...
```