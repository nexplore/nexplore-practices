# Exception Handling

To handle common exceptions by translating them into a JSON response with error information, you can use one of the following approaches.

## MVC Filters

To handle exceptions using MVC exception filters and return error information as a dto, you can use any of the provided exception filter attributes:

```csharp
public IServiceProvider ConfigureServices(IServiceCollection services)
{
    ...

    services.AddMvc(options =>
        {
            options.Filters.Add(typeof(UnhandledExceptionFilterAttribute)); // Handles all unhandled exceptions
            options.Filters.Add(typeof(SecurityExceptionFilterAttribute)); // Handles security exception
            options.Filters.Add(typeof(BusinessExceptionFilterAttribute)); // Handles all unhandled business exceptions
            options.Filters.Add(typeof(EntityValidationExceptionFilterAttribute)); // Handles all entity validation exceptions
            options.Filters.Add(typeof(EntityNotFoundExceptionFilterAttribute)); // Handles all entity not found exceptions
        });

    ...
}
```

## MVC Filters with ProblemDetails

To handle exceptions using MVC exception filters and return error information as **ProblemDetails** (RFC 7807), you need to call `AddProblemDetails`.  
This approach ensures that the response conforms to the standardized `ProblemDetails` format.

```csharp
public IServiceProvider ConfigureServices(IServiceCollection services)
{
    ...

    services.AddProblemDetails();

    ...
}
```

## Exception Handler Middleware

To handle exceptions using exeption handlers in the exception handling middleware, call `AddNexploreExceptionHandlers`.  
This extension adds multiple implementations of `IExceptionHandler`, all of which return `ProblemDetails` (RFC 7807).
This approach is recommended to be used in combination with `AddProblemDetails`.

```csharp
public IServiceProvider ConfigureServices(IServiceCollection services)
{
    ...

    services.AddProblemDetails();
    services.AddNexploreExceptionHandlers();

    ...
}
```

**Caution**: This is the currently recommended way to handle exceptions and works seamlessly with Minimal API.

## Configuration

The exception handling behavior is configured through the `ApiOptions` class.

### Exception Detail Configuration

To include exception details (message and stack trace) in the api response, you need the following configuration in `appsettings.json`:

```json
...

"Api": {
  "IncludeFullExceptionDetails": true
}

...
```

**Caution**: Do not configure this on production environments!

### Validation Errors HTTP Status Code

By default, validation errors return an HTTP status code of `400` (Bad Request).
If you need to distinguish validation errors from other types of errors, you can customize the status code. For example, to use `409` (Conflict), update the configuration in `appsettings.json` like this:

```json
...

"Api": {
  "ValidationErrorStatusCode ": 409
}

...
```

This allows you to tailor the API's response behavior to your specific needs.
