# Threat model

## What this project does and where untrusted input enters

Nexplore Practices is a set of reusable libraries, not a deployed application. There are .NET libraries in
`dotnet/src/` (NuGet `Nexplore.Practices.*`, targeting net8.0, net9.0 and net10.0) and Angular libraries in `ng/`
(npm `@nexplore/practices-*`). Downstream ASP.NET Core + Angular business applications consume them. A flaw here
affects every application that uses the affected component in its normal, documented way.

Treat these as attacker-controlled:

- **HTTP requests reaching the ASP.NET Core building blocks in `Nexplore.Practices.Web`**: model-bound DTOs,
  route and query parameters, request bodies (including raw `Stream` bodies via `StreamInputFormatter`), cookies
  read by `CookieService` / `CookieSessionDataProvider`, and the `cultureName` of `LocalizationController`.
- **`QueryParams` / `Ordering` from `Nexplore.Practices.Core`** when an application binds them from a request.
  `Nexplore.Practices.EntityFramework/Query/QueryParamsApplier.cs` turns them into LINQ expressions (property-path
  sorting, skip/take).
- **Strings and data that applications pass in from end users**: mail subjects, HTML bodies and recipients
  (`Nexplore.Practices.Mail`), cell values written to Excel exports (`Nexplore.Practices.Syncfusion.Excel`), and
  image bytes and text rendered into PDFs (`Nexplore.Practices.Syncfusion.Pdf`).
- **In the Angular libraries**: any value that can come from end users or the backend and is rendered or used as
  a URL (dialog messages, navigation links, list/filter state, log configuration read from `localStorage`).

Trusted: application configuration (`appsettings*.json`, environment variables, `IOptions<>`), the developer
who writes the consuming application's code, route definitions, deployment operators, and anyone who can run
the CLI tools.

## Components that matter most / least

Most important:
- `dotnet/src/Nexplore.Practices.Web`: exception handlers and filters (information disclosure through problem
  details and stack traces), input formatters, cookie and session handling (Data Protection, compression,
  cookie flags), localization endpoints, the unit-of-work middleware, the SPA fallback.
- `dotnet/src/Nexplore.Practices.EntityFramework`: query building from `QueryParams` (expression injection, access
  to non-public or navigation properties, unbounded paging), repositories, auditing, Data Protection key storage.
- `dotnet/src/Nexplore.Practices.Core/Security`: encryption and salt/hash services.
- `dotnet/src/Nexplore.Practices.Mail`: header injection, `data:` URI to attachment conversion, recipient handling,
  and personal data in logs.
- Angular `ng/practices-ui*`: XSS through HTML bindings (e.g. dialogs with `treatMessageAsHtml`) and unsafe URLs
  (`javascript:`) in navigation, `href`, `window.open` and `window.location`.

Lower priority (still in scope):
- `Nexplore.Practices.Syncfusion.Excel` / `.Pdf` (export only; check formula/CSV injection and image decoding of
  untrusted bytes), `Nexplore.Practices.File`, `Nexplore.Practices.Serilog`, `Nexplore.Practices.Configuration`,
  the other `ng/practices-ng-*` utility libraries.

Out of scope:
- `Nexplore.Practices.CommandLine*`: developer and deployment-time CLI tools (code generation, resx sorting, DB
  migrations). Whoever runs them is trusted.
- `ng/samples`, `ng/samples-ktbe`, Storybook stories, `ng/tools` (Nx generators), `build/` (NUKE build),
  `.github/`, `docs/`, and test projects, except as a place to put reproducers.
- Vulnerabilities in third-party dependencies (Syncfusion, MailKit, ImageSharp, Angular, EF Core …), unless this
  code uses them in an insecure way.

## How to exercise it

- The image builds the whole .NET solution (Debug) and all Angular libraries. Source is in `/src`.
- `practices-test-dotnet` rebuilds the solution offline and runs `dotnet/tests/Nexplore.Practices.Tests.Unit`
  (pass extra `dotnet test` arguments, e.g. `--filter`, `--framework net10.0`).
- `practices-test-ng` runs the Jest tests of all Angular projects offline (pass extra Nx arguments, e.g.
  `--projects=practices-ui-ktbe`).
- Unit tests use `Microsoft.AspNetCore.TestHost` and the EF Core InMemory provider. Put reproducers there.
- `dotnet/tests/Nexplore.Practices.Tests.Integration` needs SQL Server through Testcontainers (Docker) and **cannot
  run** in the offline audit environment. Read it to see how components are wired together, but do not depend
  on it to reproduce anything.
- No Syncfusion license key is provided. Syncfusion may add evaluation notices to its output, which is expected.
- No network access: use only the NuGet and npm packages already restored in the image.

## How you rate severity

Rate by impact on a typical consuming application that uses the component as documented, with default options:
- **Critical**: unauthenticated remote code execution, or authentication/authorization bypass in a consuming app,
  reachable through the library's default behavior.
- **High**: reading or changing data the caller should not have access to (e.g. sorting/filtering by arbitrary
  property paths, used as a data oracle), stored or reflected XSS from a library component with default
  settings, cryptographic weaknesses that allow decrypting or forging protected data (cookies, encrypted values),
  SQL injection.
- **Medium**: information disclosure that needs a non-default but plausible setting (e.g. full exception details
  turned on), denial of service from a single request (unbounded paging, decompression bombs, decoder crashes),
  missing cookie hardening (Secure/SameSite), formula injection in exports, sensitive data in logs.
- **Low**: defense-in-depth improvements, or issues that require the trusted application developer to misuse an
  API in an unusual way.

Behavior that only exists when a developer deliberately opts into an unsafe option (e.g. `treatMessageAsHtml`
with unsanitized user input, `IncludeFullExceptionDetails` in production) is at most Low, unless the
documentation or defaults steer developers into it.

## Reports and patches

For each finding, include: affected file/line, the entry point in a consuming app, required configuration, a
self-contained reproducer (preferably an NUnit test in `Nexplore.Practices.Tests.Unit` or a Jest spec next to the
affected Angular component), expected vs. observed behavior, and the impact. Suggest a minimal patch plus a
regression test. Do not change public API signatures unless necessary, and keep net8.0/net9.0/net10.0 multi-targeting
working.

## Anything to leave alone

- Known vulnerable or outdated dependency versions reported only from version numbers (dependency
  updates are handled separately).
- Missing security features that belong to the consuming application (authentication setup, CORS policy,
  CSP/security headers, rate limiting), unless a library component actively weakens them.
- Hard-coded test credentials, keys or connection strings inside `dotnet/tests/` and `ng/samples*`.
