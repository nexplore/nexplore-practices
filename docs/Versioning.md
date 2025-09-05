# Versioning Strategy

The versioning of Nexplore.Practices is not bound to specific release policies of frameworks like Angular or .NET.

All packages from this repository are released in sync, even if certain packages have not changed.
You can track changes of specific packages in the [Changelog](../CHANGELOG.md).
This simplifies the reasoning regarding compatibility between the different packages.

## Version Format

`MAJOR.MINOR.PATCH`

-   MAJOR: Breaking changes (e.g., API removal, behaviour changes, dropped platform support)
-   MINOR: Backwards-compatible feature additions
-   PATCH: Backwards-compatible bug fixes

## Major Dependencies Policy

We use different framework versions in our consuming projects that use Nexplore.Practices. It is not feasible for every project to upgrade to the next major version of Angular or .NET after someone updated Nexplore.Practices to make use of those new versions for a specific project.

To allow consuming projects to keep up with newer versions of Nexplore.Practices without having to follow each major framework update, we aim to make those important updates in a way that keeps the library compatible with projects that depend on it for a longer period of time.

If this is not possible or we want to drop support for an older version, this results in a breaking change and an imminent major version bump.

**Notice:** We used this approach only partially up to version 10 of Nexplore.Practices. The following example regarding .NET is our goal that we will try to implement for the future, but we will have to learn if this is a feasible approach.

### Angular

Changing the version that the samples are using does not mean that every consuming project must use of this version.
In a project that uses Nexplore.Practices, referencing a newer version of Angular than the version Nexplore.Practices depends on, means widening the peer dependencies of the packages to allow for newer versions, as long as the defined version range is compatible. This does not mean that the samples projects need to update to the newest supported version of the widened dependency at this point.

We aim to keep compatibility with the **3 most current** Angular versions ([as defined in their supported versions](https://angular.dev/reference/releases#actively-supported-versions)) as we want to update our projects to have such an Angular version at all time.

### .NET

We aim to keep compatibility down to the oldest actively supported LTS-Version according to the [.NET and .NET Core Support Policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core)

Due to our dependencies that we have, supporting multiple .NET versions independent of the version of Nexplore.Practices means to make use of [multi-targeting](https://learn.microsoft.com/en-us/dotnet/core/tutorials/libraries#how-to-multitarget).

There are likely 3 types of dependencies that we need to handle:

#### Third-party dependencies that target .NET Standard

Libraries like Autofac target .NET Standard. Such dependencies can be updated for all target .NET versions if they are compatible with supported .NET versions. But be aware that a major update of such libraries can contain breaking changes as well. And those breaking chances might not affect Nexplore.Practices directly, but it might break the consuming project if it uses Autofac through its transitive dependency by Nexplore.Practices. If you see breaking changes, think about whether this library really needs to be updated and if the answer is yes, threat it as a breaking change that will bump Nexplore.Practices to its next major version.

#### Microsoft framework libraries like Microsoft.Extensions.DependencyInjection

Frameworks from Microsoft like Microsoft.Extensions.DependencyInjection target specific .NET versions but also .NET Standard. Since a consuming project which stays on a specific .NET version doesn't expect to have major updates on such packages, we want to keep these dependencies in line with the targeted .NET version. Example: .NET 8 should only use Microsoft.Extensions.DependencyInjection up to version 8.0.1. It might otherwise mess with other transitive dependencies (like EF Core 8 references Microsoft.Extensions.\* packages with version 8) and break consumer expectations.

#### .NET version pinned libraries like Entity Framework Core

Libraries like Entity Framework are pinned to specific .NET versions (EF Core 8 needs .NET 8 and so on).
To allow multiple targets, we need to refer to compatible versions of Entity Framework Core per .NET version.
Code in Nexplore.Practices.EntityFramwork should only directly use features that are compatible between all referenced versions. If a feature is important enough, one can consider using version symbols to handle things differently based on version. But this should be used sparingly to keep things simpler.

## Best Practices

-   Clearly document breaking changes in the changelog by prepending the change with `_BREAKING_`
-   Group breaking changes to prevent multiple major version bumps in short succession
