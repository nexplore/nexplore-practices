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

RUN apt-get update && apt-get install -y --no-install-recommends curl git \
    && rm -rf /var/lib/apt/lists/*

# The libraries multi-target net10.0/net9.0/net8.0; the tests need the matching runtimes.
RUN curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh \
    && bash /tmp/dotnet-install.sh --runtime aspnetcore --channel 9.0 --install-dir /usr/share/dotnet \
    && bash /tmp/dotnet-install.sh --runtime aspnetcore --channel 8.0 --install-dir /usr/share/dotnet \
    && rm /tmp/dotnet-install.sh

# Same Node.js version as CI (.github/workflows/build.template.yml).
COPY --from=node:22.14.0-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22.14.0-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# scanner contract: the checkout lives inside the image, at /src
COPY . /src
WORKDIR /src

RUN dotnet restore dotnet/Nexplore.Practices.sln -p:NuGetAudit=false \
    && dotnet build dotnet/Nexplore.Practices.sln --no-restore --configuration Debug --disable-build-servers \
    && dotnet build-server shutdown

RUN cd ng && npm ci --no-audit --no-fund && npm run build-all

RUN chmod +x .oss-scanner/practices-test-dotnet .oss-scanner/practices-test-ng \
    && ln -s /src/.oss-scanner/practices-test-dotnet /usr/local/bin/practices-test-dotnet \
    && ln -s /src/.oss-scanner/practices-test-ng /usr/local/bin/practices-test-ng

# A red baseline fails the build, so primary_contact is notified and the auditor never starts from failing tests.
RUN timeout 900 practices-test-dotnet --verbosity minimal && dotnet build-server shutdown
RUN timeout 900 practices-test-ng

CMD ["bash"]
