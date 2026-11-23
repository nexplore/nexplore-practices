namespace Nexplore.Practices.CommandLine.Code.Exceptions
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
