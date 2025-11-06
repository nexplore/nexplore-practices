# Register Version Resolving

To enable correct version resolving, you need to register the `IVersionInfoResolver` based on a type in your solution (which has the correct version in the assembly infos):

```
builder.RegisterType<VersionInfoResolver<MyLocalType>>().As<IVersionInfoResolver>().SingleInstance();
```
