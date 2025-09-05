namespace Nexplore.Practices.Web.Dtos.Errors
{
    using System;

    public class ErrorDto
    {
        public Guid? CorrelationId { get; set; }

        public string ErrorMessage { get; set; }

        public string ErrorDetailMessage { get; set; }

        public string ErrorDetailStackTrace { get; set; }
    }
}
