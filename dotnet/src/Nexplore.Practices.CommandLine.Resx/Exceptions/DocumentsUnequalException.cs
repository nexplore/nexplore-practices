namespace Nexplore.Practices.CommandLine.Resx.Exceptions
{
    using System;

    public class DocumentsUnequalException : Exception
    {
        public DocumentsUnequalException(string message) :
            base(message)
        {
        }
    }
}
