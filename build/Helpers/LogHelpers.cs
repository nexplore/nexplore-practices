using Nuke.Common.Tooling;
using Serilog;

namespace Nexplore.Practices.Build.Helpers;

public class LogHelpers
{
    /// <summary>
    /// Since NX puts non-error message into STDERR, we treat all log messages as debug which are not clearly warnings
    /// </summary>
    public static void OverrideNpmLogger(OutputType type, string message)
    {
        if (message.StartsWith("npmWARN") || message.StartsWith("npm WARN"))
        {
            Log.Warning(message);
        }
        else
        {
            Log.Debug(message);
        }
    }
}
