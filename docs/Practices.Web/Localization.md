## Localization

The localization feature works by using utilizing the `IStringLocalizer<T>` and resource files (see https://docs.microsoft.com/en-us/aspnet/core/fundamentals/localization). To share them between the backend and the frontend,
you can configure the `LocalizationController` to provide relevant translations in the format:

```
{
	"<firstResource>": {
		"<key>": "<value>"
	}
	"<secondResource>": {
		"<key>": "<value>"
	}
}
```

To automatically get the resources in the correct language, you have to set the correct UI Culture according to the provided documentation above.

Practices implements a custom `IStringLocalizer` for resource files, which is capable of formatting template literals such as `Foo {{ bar }}` to improve the reusability of resource strings (see [`StringLocalizerWithFormat`](/Backend/src/Nexplore.Practices.Web/Localization/StringLocalizerWithFormat.cs)). It also allows to use and configure a fallback resource (see [`StringLocalizerWithFallback`](/Backend/src/Nexplore.Practices.Web/Localization/StringLocalizerWithFallback.cs)

## Frontend resources configuration

You need to configure the localization options while building the `IWebHost` by defining which of the resource files are relevant for the frontend to save bandwidth:

```
...
.ConfigureAppConfiguration(options =>
{
    options.AddInMemoryCollection(new Dictionary<string, string>
    {
        { "Localization:ClientResourceTypes:0", <Namespace.To.Resource1, Assembly>" },
        { "Localization:ClientResourceTypes:1", <Namespace.To.Resource2, Assembly>" }
    });
})
...
```

Further you need to define the route to the `LocalizationController`

```
...
app.UseMvc(routeBuilder =>
	{
		routeBuilder.MapRoute("localization", "/api/localization/getlocalizations/{cultureName}.json", new { controller = "Localization", action = "GetLocalizations" });
	});
...
```

## Resources from Practices

You need to localize texts from Practices within your project. The mapping between the resources names in Practices and the resource files in your project can be configured with the localization options. The rewrites are configured as an array, where each element has the properties "RewriteFrom", "RewriteTo", and "FallbackTo" (optional).

```
...
.ConfigureAppConfiguration(options =>
{
    options.AddInMemoryCollection(new Dictionary<string, string>
    {
        { "Localization:RewriteResourceTypes:0:RewriteFrom", <Practices Type>" }
        { "Localization:RewriteResourceTypes:0:RewriteTo", <Namespace.To.Resource, Assembly>" }
        { "Localization:RewriteResourceTypes:0:FallbackTo", <Namespace.To.Resource, Assembly>" }
    });
})
...
```

Currently there are the following types available in Practices:

- `Nexplore.Practices.Core.Localization.PracticesResourceNames` (general resources)
- `Nexplore.Practices.Core.Localization.DomainModelResourceNames` (should contain all entity and property names from the domain model)
- `Nexplore.Practices.Core.Localization.ValidationResourceNames` (validation messages)

Please refer to the specific class to see all available resource keys.

## Localized status code pages

To return correct status code pages (e.g. on a 404 status code), you need to configure the following middleware:

```
...
app.UseLocalizedStatusCodePages(container);
...
```

You need to localize the messages for the different status codes by key `Error_StatusCode_{StatusCode}`, e.g. `Error_StatusCode_404`.
