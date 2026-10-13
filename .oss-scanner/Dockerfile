# Build environment for the Anthropic OSS scanner (https://github.com/anthropics/oss-scanner).
# The scanner builds this image with the repository root as build context. Network access is only available
# during this build, so every dependency needed to build and test is restored here.
FROM mcr.microsoft.com/dotnet/sdk:10.0

ENV DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_NOLOGO=1 \
    DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1 \
    DOTNET_CLI_WORKLOAD_UPDATE_NOTIFY_DISABLE=true \
    NUGET_XMLDOC_MODE=skip \
    MSBUILDDISABLENODEREUSE=1 \
    NX_DAEMON=false \
    NX_NO_CLOUD=true \
    CI=true

RUN apt-get update && apt-get install -y --no-install-recommends \
      bash ca-certificates curl git python3 \
    && rm -rf /var/lib/apt/lists/*

# The libraries multi-target net10.0/net9.0/net8.0; the tests need the matching runtimes.
RUN curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh \
    && bash /tmp/dotnet-install.sh --runtime aspnetcore --channel 9.0 --install-dir /usr/share/dotnet \
    && bash /tmp/dotnet-install.sh --runtime aspnetcore --channel 8.0 --install-dir /usr/share/dotnet \
    && rm /tmp/dotnet-install.sh

# Node.js for the Angular workspace (same major as CI).
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# scanner contract: the checkout lives inside the image, at /src
COPY . /src
WORKDIR /src

# --- .NET: restore and build the whole solution (src + tests) in Debug ---
RUN dotnet restore dotnet/Nexplore.Practices.sln -p:NuGetAudit=false \
    && dotnet build dotnet/Nexplore.Practices.sln --no-restore --configuration Debug --disable-build-servers \
    && dotnet build-server shutdown

# --- Angular: install dependencies and build all libraries ---
RUN cd ng && npm ci --no-audit --no-fund && npm run build-all

# Helper scripts so the offline audit can re-run builds and tests without network access.
RUN printf '%s\n' \
      '#!/usr/bin/env bash' \
      '# Unit tests only: the integration tests need SQL Server via Testcontainers (Docker), unavailable offline.' \
      'set -euo pipefail' \
      'cd /src' \
      'dotnet build dotnet/Nexplore.Practices.sln --no-restore --configuration Debug --disable-build-servers' \
      'dotnet test dotnet/tests/Nexplore.Practices.Tests.Unit/Nexplore.Practices.Tests.Unit.csproj --no-build --no-restore --configuration Debug "$@"' \
      > /usr/local/bin/practices-test-dotnet \
    && printf '%s\n' \
      '#!/usr/bin/env bash' \
      'set -euo pipefail' \
      'cd /src/ng' \
      'npx nx run-many -t test --ci --run-in-band --skip-nx-cache "$@"' \
      > /usr/local/bin/practices-test-ng \
    && chmod +x /usr/local/bin/practices-test-dotnet /usr/local/bin/practices-test-ng

# Run the cheap tests so we know the image works, without letting a failing test abort the build.
RUN (timeout 900 dotnet test dotnet/tests/Nexplore.Practices.Tests.Unit/Nexplore.Practices.Tests.Unit.csproj \
      --no-build --no-restore --configuration Debug --verbosity minimal \
      || echo "WARNING: dotnet unit tests reported failures") \
    && dotnet build-server shutdown
RUN (cd ng && timeout 900 npm run test-ci || echo "WARNING: Angular tests reported failures")

CMD ["bash"]
