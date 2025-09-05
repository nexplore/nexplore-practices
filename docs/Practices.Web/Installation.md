# Installation

To correctly initialize the library you need to register the module in your Autofac Container Builder:

```
...

builder.RegisterModule<Practices.Web.Registry>();

...
```

## Prerequisites

The library contains a controller activater which resolves controllers via dependency injection. To ensure this works correctly, each controller in your solution must be
registered in the Autofac container. Your can do this e.g. by calling `.AddControllersAsServices()` while confguring MVC:

```
public IServiceProvider ConfigureServices(IServiceCollection services)
{
    ...

    services.AddMvc()
        .SetCompatibilityVersion(CompatibilityVersion.Version_2_2)
        .AddControllersAsServices();

    ...
}
```
