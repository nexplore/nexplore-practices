# OSS scanner setup

Configuration for the [Anthropic OSS scanner](https://github.com/anthropics/oss-scanner), which builds this repository
in an isolated VM and then audits it for security issues without network access.

- `Dockerfile`: builds the .NET solution and the Angular libraries and restores every dependency while the network
  is still available.
- `threat_model.md`: scope, trust boundaries and severity guidance that the scanner reads before it starts.

## Enrollment

Enrollment is a pull request to `anthropics/oss-scanner` that adds `projects/nexplore-practices/project.yaml`:

```yaml
repo: https://github.com/nexplore/nexplore-practices#main
primary_contact: security@nexplore.ch
homepage: https://www.nexplore.ch
dockerfile: .oss-scanner/Dockerfile
threat_model: .oss-scanner/threat_model.md
```

Check it in the oss-scanner checkout with `tools/validate.py`. On Linux, `tools/check nexplore-practices` builds the
image the way the scanner does and opens a shell with no network.

## Testing the image locally

```bash
docker build -f .oss-scanner/Dockerfile -t practices-oss-scan .
docker run --rm --network none practices-oss-scan practices-test-dotnet --framework net10.0
docker run --rm --network none practices-oss-scan practices-test-ng
```

Build from a clean clone so that local `node_modules`, `bin` and `obj` folders are not copied into the image.
The integration tests (`Nexplore.Practices.Tests.Integration`) need SQL Server via Testcontainers and therefore do
not run in the scanner.
