namespace Nexplore.Practices.Web.Configuration
{
    using Microsoft.AspNetCore.Http;

    public class ApiOptions
    {
        public const string NAME = "Api";

        public bool IncludeFullExceptionDetails { get; set; }

        public int ValidationErrorStatusCode { get; set; } = StatusCodes.Status400BadRequest;
    }
}
