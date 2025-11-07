# Nexplore Practices

## Documentation

The documentation for Practices can be found [here](./docs/Documentation.md).

## Backend Projects

The following backend packages are available:

- [Nexplore.Practices.Configuration](./dotnet/src/Nexplore.Practices.Configuration/) - Configuration utilities
- [Nexplore.Practices.Core](./dotnet/src/Nexplore.Practices.Core/) - Core utilities and base functionality
- [Nexplore.Practices.EntityFramework](./dotnet/src/Nexplore.Practices.EntityFramework/) - Entity Framework extensions and utilities
- [Nexplore.Practices.File](./dotnet/src/Nexplore.Practices.File/) - File handling utilities
- [Nexplore.Practices.Mail](./dotnet/src/Nexplore.Practices.Mail/) - Email sending functionality
- [Nexplore.Practices.Serilog](./dotnet/src/Nexplore.Practices.Serilog/) - Logging with Serilog
- [Nexplore.Practices.Syncfusion.Excel](./dotnet/src/Nexplore.Practices.Syncfusion.Excel/) - Excel document manipulation
- [Nexplore.Practices.Web](./dotnet/src/Nexplore.Practices.Web/) - Web application utilities

## Frontend Projects

The following frontend packages are available:

- [practices-ng-commands](./ng/practices-ng-commands/README.md) - Angular commands utilities
- [practices-ng-common-util](./ng/practices-ng-common-util/README.md) - Common Angular utilities
- [practices-ng-dirty-guard](./ng/practices-ng-dirty-guard/README.md) - Form dirty state guard implementation
- [practices-ng-forms](./ng/practices-ng-forms/README.md) - Angular forms utilities
- [practices-ng-list-view-source](./ng/practices-ng-list-view-source/README.md) - List view source implementation
- [practices-ng-logging](./ng/practices-ng-logging/README.md) - Angular logging utilities
- [practices-ng-signals](./ng/practices-ng-signals/README.md) - Angular signals utilities
- [practices-ng-status](./ng/practices-ng-status/README.md) - Status handling utilities
- [practices-ui](./ng/practices-ui/README.md) - Base UI components
- [practices-ui-clarity](./ng/practices-ui-clarity/README.md) - Additional components and utilities for the [Clarity Design library](https://clarity.design/)
- [practices-ui-ktbe](./ng/practices-ui-ktbe/README.md) - UI component library implementing the [Kanton Bern Styleguide](https://kantonbern.snowflake.ch/styleguides/1/Kanton-Bern/)

## Contribution

We use [GitHub flow](https://guides.github.com/introduction/flow/) as our branching strategy in this repository. To contribute, please add a new feature branch based on the master branch. Make all your changes in the feature branch and add a pull request when you are done. Even if we don't create a release with every commit in the master branch it should be possible to do so.

Every update on a branch starts a new build on the build server. Every tag will trigger the deployment pipeline which publishes the artifacts to the Nexplore [NuGet](https://nuget.nexplore.ch/) and [NPM](http://npm.nexplore.ch/) repository.

Please always update the [CHANGELOG](./CHANGELOG.md) within your pull request.

## Versioning

The library is versioned with [Semantic Versioning](https://semver.org/).

To support old versions we use "support" branches. If a commit introduces a breaking change on the master branch, we create a new branch `support/<major>.x` (e.g. `support/1.x`) from the latest tag of the current major version. It is also possible to create a new minor tag from the latest commit on the master branch (before the breaking change) and create the support branch starting from there. From now on the support branch acts as "master" branch for all updates related to the specific version (e.g. "1.3" or "1.2.1"). If a new feature should be introduced in multiple support or even the master branch, separate pull requests have to be created for each support/master branch.
