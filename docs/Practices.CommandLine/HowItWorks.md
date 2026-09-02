# How it works

The CommandLine library is built on Microsoft’s [System.CommandLine](https://learn.microsoft.com/en-us/dotnet/standard/commandline/), which Microsoft itself uses for the .NET CLI, among other things.

Practices.CommandLine introduces an abstraction to make the System.CommandLine framework easily accessible and support IoC. However, the abstraction exposes only a subset of System.CommandLine’s capabilities. Many features are currently hidden by design because they are unlikely to be needed or because hiding them provides a more consistent usage model.

## Commands

The library provides the `ICliCommand` interface and the abstract base classes `CliCommandBase` and `CliCommandBase<TModel, TModelBinder>`. Concrete commands must derive from one of these abstract base classes.

During bootstrapping, all `ICliCommand` implementations are registered with the container, enabling full dependency injection support for commands.

- `CliCommandBase` is used for commands without options.
- `CliCommandBase<TModel, TModelBinder>` is used for commands that have options (configuration values or arguments) assigned to them.

:::caution

Important considerations when registering commands with the IoC container:

- Register commands as single instances.
- Inject dependencies into the command constructor as `Func` instances.

:::

### Hierarchy (Subcommands)

System.CommandLine provides [commands](https://learn.microsoft.com/en-us/dotnet/standard/commandline/define-commands), which can be organized hierarchically. This makes it possible to group related commands.

In the following example, `migrate` is a subcommand of `database`. The `database` command therefore serves only to group commands related to the database.

```bash
MyCli.exe database migrate
```

To define a subcommand, apply the `HasParentCliCommand` attribute to the concrete class. Specify the type of the grouping command as the attribute’s argument.

```cs
[HasParentCliCommand(typeof(DatabaseCommand))]
public class MigrateCommand : CliCommandBase
```

### Executing a Command

The operation ultimately performed by a command is defined by overriding `Task<int> ExecuteAsync(CancellationToken cancellationToken)` from `CliCommandBase`. Custom commands must therefore implement this method. The actual implementation should reside in a service or similar component rather than directly in `ExecuteAsync`.

Dependencies can be made available to the command through constructor injection as usual (as `Func` instances).

Any option values are provided through the `OptionsValuesModel` property. This property is available only in the generic variant of `CliCommandBase` and requires specific [model binding](#providing-option-values-through-model-binding).

## Options

System.CommandLine provides [options](https://learn.microsoft.com/en-us/dotnet/standard/commandline/define-commands#define-options). Options supply a command with information required for its execution.

Options are defined independently and can be associated with one or more commands. Option names use kebab case (for example, `--file-path` and `--dry-run`).

To associate an option with a command, apply the `HasCliOption` attribute to the command’s concrete class.

```cs
[HasCliOption(typeof(OutputOption))]
public class GenTsPermissionsCommand : CliCommandBase<CodeGenOptionsValues, CodeGenOptionsValuesBinder>
```

To make option values automatically available to the command, the command must derive from the generic version of `CliCommandBase`.

### Providing Option Values Through Model Binding

The command-line parser uses options as descriptors. Any supplied values are not directly available through the options associated with the command being executed. To provide consistent, strongly typed access, System.CommandLine’s custom model binding served as the basis for an abstracted implementation.

The generic `CliCommandBase` specifies a `TModel` type and a `TModelBinder` type. Both must be implemented explicitly.

- **TModel** defines the resulting model class. It serves as a simple DTO and contains only properties whose types match the corresponding option values.
- **TModelBinder** defines the class responsible for populating the model with the option values. It must derive from `ModelBinderBase<TModel>`.

The overridden `GetModel` method receives the options associated with the command and an `IOptionsValuesAccessor`. These can be used to retrieve the option values and assign them to the corresponding model properties.

```cs
public class CodeGenOptionsValues
{
    public FileSystemInfo Output { get; init; }
}
```

```cs
public class CodeGenOptionsValuesBinder : ModelBinderBase<CodeGenOptionsValues>
{
    public override CodeGenOptionsValues GetModel(IEnumerable<ICliOption> options, IOptionsValuesAccessor optionsValuesAccessor)
    {
        return new CodeGenOptionsValues
        {
            Output = optionsValuesAccessor.GetValueForCliOption(options.OfType<OutputOption>().First())
        };
    }
}
```
