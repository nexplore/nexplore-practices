# Validation

In your project, you need to create a `ValidationContext`, register the `IValidationProvider` in the
dependency injection container and mark your entities as validatable.

The `ValidationContext` allows you to inject several dependencies into your `Validate()` method, e.g.:

```csharp
public interface IValidationContext
{
    IClock Clock { get; }
}

public class ValidationContext : IValidationContext
{
    public ValidationContext(IClock clock)
    {
        this.Clock = clock;
    }

    public IClock Clock { get; }
}
```

In your registry you need to register the context as well as the validation provider itself:

```csharp
builder.RegisterType<ValidationContext>().As<IValidationContext>().InstancePerLifetimeScope();
builder.RegisterType<ValidationProvider<IValidationContext>>().As<IValidationProvider>().InstancePerLifetimeScope();
```

Last but not least you need to mark your entities (usually `EntityBase`) to be validatable. This gives you a
`Validate()` method where you can return validation errors:

```csharp
public class MySampleEntity : IValidatable<IValidationContext>
{
    public virtual IEnumerable<EntityValidationError> Validate(IValidationContext context)
    {
        yield return new EntityValidationError("This is a sample error", nameof(this.SampleProperty));
    }
}
```
