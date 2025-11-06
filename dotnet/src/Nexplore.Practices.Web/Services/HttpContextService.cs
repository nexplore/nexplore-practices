namespace Nexplore.Practices.Web.Services
{
    using System.Web;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Net.Http.Headers;
    using Nexplore.Practices.Core;
    using Nexplore.Practices.Core.Services;
    using ContentDispositionHeaderValue = System.Net.Http.Headers.ContentDispositionHeaderValue;

    public class HttpContextService : IHttpContextService
    {
        private const string INLINE = "inline";
        private const string ATTACHMENT = "attachment";

        private readonly IHttpContextAccessor httpContextAccessor;

        public HttpContextService(IHttpContextAccessor httpContextAccessor)
        {
            this.httpContextAccessor = httpContextAccessor;
        }

        public void SetFileDownloadHeaders(string fileName, string contentType, long fileSize, string eTag = null, bool displayInline = true)
        {
            var response = this.httpContextAccessor?.HttpContext?.Response;
            Guard.NotNull(response, nameof(response));

            response.ContentLength = fileSize;
            response.ContentType = contentType;

            ContentDispositionHeaderValue contentDisposition = displayInline ? new ContentDispositionHeaderValue(INLINE) : new ContentDispositionHeaderValue(ATTACHMENT);

            /*
             * The FileNameStar property uses IETF RFC 5987 encoding.
             * The FileName and FileNameStar properties differ only in that FileNameStar uses the encoding
             * defined in IETF RFC 5987, allowing the use of characters not present in the ISO-8859-1 character set.
             */
            contentDisposition.FileName = HttpUtility.UrlPathEncode(fileName);
            contentDisposition.FileNameStar = fileName;

            response.Headers.Append(HeaderNames.ContentDisposition, contentDisposition.ToString());

            if (!string.IsNullOrWhiteSpace(eTag))
            {
                var request = this.httpContextAccessor?.HttpContext?.Request;
                Guard.NotNull(request, nameof(request));

                var eTagValue = $"\"{eTag}\"";

                if (request.Headers.TryGetValue("If-None-Match", out var value) && value.ToString() == eTagValue)
                {
                    response.StatusCode = StatusCodes.Status304NotModified;
                    response.ContentLength = 0;
                }

                response.Headers["ETag"] = eTagValue;
            }
        }
    }
}
