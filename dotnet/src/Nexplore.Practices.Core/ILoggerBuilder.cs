namespace Nexplore.Practices.Core
{
    public interface ILoggerBuilder
    {
        void BuildLogger();

        void CloseAndFlush();
    }
}
