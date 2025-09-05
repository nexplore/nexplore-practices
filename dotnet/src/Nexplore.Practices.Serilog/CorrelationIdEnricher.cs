namespace Nexplore.Practices.Serilog
{
    using global::Serilog.Core;
    using global::Serilog.Events;
    using Nexplore.Practices.Core.Services;

    /// <summary>
    /// This enricher enables the usage of the {CorrelationId} parameter in the log template.
    /// The parameter will be replaced by the value of RequestId in the HttpRequest.
    /// </summary>
    public class CorrelationIdEnricher : ILogEventEnricher
    {
        private const string CORRELATION_ID_PROPERTY_NAME = "CorrelationId";

        private readonly IHttpRequestService httpRequestService;

        public CorrelationIdEnricher(IHttpRequestService httpRequestService)
        {
            this.httpRequestService = httpRequestService;
        }

        public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
        {
            var correlationId = this.httpRequestService.GetRequestId();
            var correlationIdProperty = new LogEventProperty(CORRELATION_ID_PROPERTY_NAME, new ScalarValue(correlationId));

            logEvent.AddOrUpdateProperty(correlationIdProperty);
        }
    }
}
