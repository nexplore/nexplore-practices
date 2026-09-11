using System;
using System.IO;
using Nexplore.Practices.Build.Helpers;
using Nuke.Common;
using Nuke.Common.IO;
using Nuke.Common.ProjectModel;
using Nuke.Common.Tooling;
using Nuke.Common.Tools.DotNet;
using Nuke.Common.Tools.GitVersion;
using Nuke.Common.Tools.Npm;

namespace Nexplore.Practices.Build;

partial class Build : NukeBuild
{
    public static int Main() => Execute<Build>(x => x.BuildPackAll);

    [GitVersion(UpdateBuildNumber = false)] readonly GitVersion GitVersion;

    private readonly Solution DotNetSolution =
        (RootDirectory / "dotnet/Nexplore.Practices.sln").ReadSolution();

    private AbsolutePath OutputDirectory => TemporaryDirectory / "output";
    private AbsolutePath TemplateDirectory => RootDirectory / "build" / "templates";
    private AbsolutePath TestResultDirectory => TemporaryDirectory / "test-results";
    private readonly AbsolutePath NgDirectory = RootDirectory / "ng";
    private AbsolutePath NgDistributionDirectory => NgDirectory / "dist";

    // The Angular 22 verification package lives next to the root Angular 19 Nx workspace and
    // ships its own package-lock.json. The target chain below installs, builds and tests it
    // in isolation so its Angular 22 dependencies never leak into the root ng/ Nx workspace.
    private readonly AbsolutePath SignalFormsAngular22Directory = RootDirectory / "ng" / "practices-ng-forms-signal-forms" / "angular-22";

    private readonly string[] NgLibProjects = [
        "practices-ui",
        "practices-ui-clarity",
        "practices-ui-ktbe",
        "practices-ng-status",
        "practices-ng-signals",
        "practices-ng-logging",
        "practices-ng-forms",
        "practices-ng-dirty-guard",
        "practices-ng-common-util",
        "practices-ng-commands",
        "practices-ng-list-view-source"
    ];

    private readonly string[] NgAppProjects = ["samples", "samples-ktbe"];

    Target Clean => _ => _
        .Executes(() =>
        {
            OutputDirectory.DeleteDirectory();
            TestResultDirectory.DeleteDirectory();
        });

    Target BuildDotNet => _ => _
        .DependsOn(Clean)
        .Executes(() =>
        {
            var assemblyVersion = GitVersion.PracticesAssemblyVersion();
            var assemblyFileVersion = GitVersion.PracticesAssemblyFileVersion();

            DotNetTasks.DotNetBuild(settings => settings
                .SetProjectFile(DotNetSolution)
                .SetConfiguration(Configuration.Release)
                .SetNoRestore(false)
                .SetWarningsAsErrors()
                .SetVerbosity(DotNetVerbosity.minimal)
                .SetVersion(assemblyVersion)
                .SetFileVersion(assemblyFileVersion)
            );
        });

    Target BuildNg => _ => _
        .DependsOn(Clean)
        .After(BuildDotNet)
        .Executes(() =>
        {
            NpmTasks.NpmCi(settings => settings
                .SetProcessWorkingDirectory(NgDirectory));

            NpmTasks.NpmRun(settings => settings
                   .SetCommand("build-all")
                   .SetProcessLogger(LogHelpers.OverrideNpmLogger)
                   .SetProcessWorkingDirectory(NgDirectory));
        });

    Target AnalyzeDotNet => _ => _
        .DependsOn(BuildDotNet)
        .After(BuildNg)
        .Executes(() =>
        {
            DotNetTasks.DotNetFormat(s => s
                .EnableVerifyNoChanges()
                .SetProcessWorkingDirectory(DotNetSolution.Directory));
        });

    Target AnalyzeNg => _ => _
        .DependsOn(BuildNg)
        .After(AnalyzeDotNet)
        .Executes(() =>
        {
            NpmTasks.NpmRun(settings => settings
                .SetCommand("lint-all-errors")
                .SetProcessLogger(LogHelpers.OverrideNpmLogger)
                .SetProcessWorkingDirectory(NgDirectory));
        });

    Target TestDotNet => _ => _
        .DependsOn(AnalyzeDotNet)
        .After(AnalyzeNg)
        .Executes(() =>
        {
            DotNetTasks.DotNetTest(settings => settings
                .SetProjectFile(DotNetSolution)
                .SetNoRestore(true)
                .SetNoBuild(true)
                .SetConfiguration(Configuration.Release)
                .SetResultsDirectory(TestResultDirectory)
                .SetLoggers("trx"));
        });

    Target TestNg => _ => _
        .DependsOn(AnalyzeNg)
        .After(TestDotNet)
        .Executes(() =>
        {
            Environment.SetEnvironmentVariable("JEST_JUNIT_OUTPUT_DIR", TestResultDirectory);

            NpmTasks.NpmRun(settings => settings
                .SetCommand("test-ci")
                .SetProcessLogger(LogHelpers.OverrideNpmLogger)
                .SetProcessWorkingDirectory(NgDirectory));
        });

    Target BuildSignalFormsAngular22 => _ => _
        .DependsOn(Clean)
        .Executes(() =>
        {
            // Installs the Angular 22 toolchain into the nested node_modules and runs ng-packagr
            // against the package's own ng-package.json. Working directory is the nested package
            // so npm resolves only the Angular 22 dependency tree.
            NpmTasks.NpmCi(settings => settings
                .SetProcessWorkingDirectory(SignalFormsAngular22Directory));

            NpmTasks.NpmRun(settings => settings
                .SetCommand("build")
                .SetProcessLogger(LogHelpers.OverrideNpmLogger)
                .SetProcessWorkingDirectory(SignalFormsAngular22Directory));
        });

    Target TestSignalFormsAngular22 => _ => _
        .DependsOn(BuildSignalFormsAngular22)
        .Executes(() =>
        {
            // Runs the Jest specs declared by the Angular 22 verification package. Reusing the
            // JEST_JUNIT_OUTPUT_DIR keeps any future junit reporter aligned with the root Nx lane
            // without forcing the nested jest.config.ts to opt in.
            Environment.SetEnvironmentVariable("JEST_JUNIT_OUTPUT_DIR", TestResultDirectory);

            NpmTasks.NpmRun(settings => settings
                .SetCommand("test")
                .SetProcessLogger(LogHelpers.OverrideNpmLogger)
                .SetProcessWorkingDirectory(SignalFormsAngular22Directory));
        });

    Target VerifySignalFormsAngular22 => _ => _
        .DependsOn(BuildSignalFormsAngular22, TestSignalFormsAngular22);

    Target BuildKtBeStorybook => _ => _
        .DependsOn(BuildNg)
        .After(TestNg)
        .Executes(() =>
        {
            NpmTasks.NpmRun(settings => settings
                .SetCommand("build-storybook-ktbe")
                .SetProcessLogger(LogHelpers.OverrideNpmLogger)
                .SetProcessWorkingDirectory(NgDirectory));
        });

    Target PackDotNet => _ => _
        .DependsOn(TestDotNet)
        .After(BuildKtBeStorybook)
        .Executes(() =>
        {
            var version = GitVersion.PracticesPackageVersion();
            var nugetDirectory = OutputDirectory / "nuget";

            DotNetTasks.DotNetPack(settings => settings
                .SetProject(DotNetSolution)
                .SetNoRestore(true)
                .SetNoBuild(true)
                .SetVerbosity(DotNetVerbosity.minimal)
                .SetConfiguration(Configuration.Release)
                .SetVersion(version)
                .SetOutputDirectory(nugetDirectory)
            );
        });

    Target PackNg => _ => _
        .DependsOn(TestNg)
        .After(PackDotNet)
        .Executes(() =>
        {
            var npmDirectory = OutputDirectory / "npm";
            npmDirectory.CreateDirectory();

            var version = GitVersion.PracticesPackageVersion();

            foreach (var project in NgLibProjects)
            {
                var projectDirectory = NgDistributionDirectory / project;
                var packagesFile = projectDirectory / "package.json";
                packagesFile.ReplaceContent("0.0.0-VERSION", version);

                var zipFile = npmDirectory / $"{project}.{version}.zip";
                projectDirectory.ZipTo(zipFile);
            }
        });

    Target PackKtBeStorybook => _ => _
        .DependsOn(BuildKtBeStorybook)
        .After(PackNg)
        .Executes(() =>
        {
            var version = GitVersion.PracticesPackageVersion();
            var ktBeStorybookDirectory = NgDistributionDirectory / "storybook" / "practices-ui-ktbe";
            var storybookOutputDirectory = OutputDirectory / "storybook";

            var zipFile = storybookOutputDirectory / $"storybook-practices-ui-ktbe.{version}.zip";
            ktBeStorybookDirectory.ZipTo(zipFile);
        });

    Target BuildPackAll => _ => _
        .DependsOn(PackDotNet, PackNg, PackKtBeStorybook, VerifySignalFormsAngular22);
}
