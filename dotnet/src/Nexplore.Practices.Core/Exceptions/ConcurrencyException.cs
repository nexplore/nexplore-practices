namespace Nexplore.Practices.Core.Exceptions
{
    using Nexplore.Practices.Core.Localization;

    public class ConcurrencyException : BusinessException
    {
        public ConcurrencyException()
            : base(typeof(PracticesResourceNames), PracticesResourceNames.CONCURRENCY_EXCEPTION)
        {
        }
    }
}
