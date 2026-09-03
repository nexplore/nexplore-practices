namespace Nexplore.Practices.CommandLine.Code.Exceptions
{
    using System;

    public class DocumentSortingException : Exception
    {
        public DocumentSortingException(string message) :
            base(message)
        {
        }
    }
}
