namespace Nexplore.Practices.CommandLine.Exceptions
{
    using System;

    public class CliConfigurationException : Exception
    {
        public CliConfigurationException(string message)
            : base(message)
        {
        }
    }
}
