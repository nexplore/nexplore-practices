using Nuke.Common.CI.GitHubActions;
using Nuke.Common.Tools.GitVersion;

namespace Nexplore.Practices.Build.Helpers;

public static class VersionHelpers
{
    public static string PracticesAssemblyVersion(this GitVersion gitVersion)
    {
        return $"{gitVersion.MajorMinorPatch}.0";
    }

    public static string PracticesAssemblyFileVersion(this GitVersion gitVersion)
    {
        var buildId = EvaluateBuildId();
        return $"{gitVersion.MajorMinorPatch}.{buildId}";
    }

    public static string PracticesPackageVersion(this GitVersion gitVersion)
    {
        var buildId = EvaluateBuildId();

        if (!string.IsNullOrEmpty(gitVersion.PreReleaseLabel))
        {
            return $"{gitVersion.MajorMinorPatch}-{gitVersion.PreReleaseLabel}.{buildId}";
        }

        return $"{gitVersion.MajorMinorPatch}";
    }

    public static bool IsPublicRelease(this GitVersion gitVersion)
    {
        return string.IsNullOrEmpty(gitVersion.PreReleaseLabel);
    }

    private static long EvaluateBuildId()
    {
        var buildId = GitHubActions.Instance?.BuildId ?? 0;

        // ushort.MaxValue is the maximum number the 4th position can be in an Assembly version. We likely "never" exeed this
        return buildId % ushort.MaxValue;
    }
}
