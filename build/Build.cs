using System;
using System.IO;
using System.Linq;
using Nexplore.Practices.Build.Helpers;
using Nuke.Common;
using Nuke.Common.CI.AzurePipelines;
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
        SolutionModelTasks.ParseSolution(RootDirectory / "dotnet/Nexplore.Practices.sln");

    private AbsolutePath OutputDirectory => TemporaryDirectory / "output";
    private AbsolutePath TemplateDirectory => RootDirectory / "build" / "templates";
    private AbsolutePath TestResultDirectory => TemporaryDirectory / "test-results";
    private readonly AbsolutePath NgDirectory = RootDirectory / "ng";
    private AbsolutePath NgDistributionDirectory => NgDirectory / "dist";

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

    Target UpdateBuildNumber => _ => _
        .Unlisted()
        .Executes(() =>
        {
            AzurePipelines.Instance?.UpdateBuildNumber(GitVersion.PracticesPackageVersion());
        });

    Target Clean => _ => _
        .DependsOn(UpdateBuildNumber)
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
            try
            {
                DotNetTasks.DotNetTest(settings => settings
                    .SetProjectFile(DotNetSolution)
                    .SetNoRestore(true)
                    .SetNoBuild(true)
                    .SetConfiguration(Configuration.Release)
                    .SetResultsDirectory(TestResultDirectory)
                    .SetLoggers("trx"));
            }
            finally
            {
                var testResultFiles = TestResultDirectory.GlobFiles("*.trx").Select(filePath => filePath.ToString());
                AzurePipelines.Instance?.PublishTestResults(
                    "DotNet Tests",
                    AzurePipelinesTestResultsType.VSTest,
                    testResultFiles);
            }
        });

    Target TestNg => _ => _
        .DependsOn(AnalyzeNg)
        .After(TestDotNet)
        .Executes(() =>
        {
            Environment.SetEnvironmentVariable("JEST_JUNIT_OUTPUT_DIR", TestResultDirectory);

            try
            {
                NpmTasks.NpmRun(settings => settings
                    .SetCommand("test-ci")
                    .SetProcessLogger(LogHelpers.OverrideNpmLogger)
                    .SetProcessWorkingDirectory(NgDirectory));
            }
            finally
            {
                var testResultFiles = TestResultDirectory.GlobFiles("*.xml").Select(filePath => filePath.ToString()).ToArray();
                if (testResultFiles.Length > 0)
                {
                    AzurePipelines.Instance?.PublishTestResults(
                        "Ng Tests",
                        AzurePipelinesTestResultsType.JUnit,
                        testResultFiles);
                }
            }
        });

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
        .DependsOn(PackDotNet, PackNg, PackKtBeStorybook);
}
