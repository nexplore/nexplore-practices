namespace Nexplore.Practices.Serilog
{
    using global::Serilog.Core;
    using global::Serilog.Events;
    using Nexplore.Practices.Core.Administration;

    /// <summary>
    /// This enricher enables the usage of the {UserId} parameter in the log template.
    /// The parameter will be replaced by the value of UserId of the currently logged-in user.
    /// </summary>
    public class UserIdEnricher : ILogEventEnricher
    {
        private const string USER_ID_PROPERTY_NAME = "UserId";

        private readonly IUser user;

        public UserIdEnricher(IUser user)
        {
            this.user = user;
        }

        public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
        {
            var userId = this.user.UserId;
            var correlationIdProperty = new LogEventProperty(USER_ID_PROPERTY_NAME, new ScalarValue(userId));

            logEvent.AddOrUpdateProperty(correlationIdProperty);
        }
    }
}
