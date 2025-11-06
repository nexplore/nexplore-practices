namespace Nexplore.Practices.Core
{
    public class VersionInfoResolver<TType> : IVersionInfoResolver
    {
        public VersionInfoResolver()
        {
            var version = typeof(TType).Assembly.GetName().Version;

            this.CurrentVersion = version.ToString();
            this.CurrentVersionShort = version.ToString(3);
        }

        public string CurrentVersion { get; }

        public string CurrentVersionShort { get; }
    }
}
