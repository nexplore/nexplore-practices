namespace Nexplore.Practices.Core
{
    public interface IVersionInfoResolver
    {
        string CurrentVersion { get; }

        string CurrentVersionShort { get; }
    }
}
