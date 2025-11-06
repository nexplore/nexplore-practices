namespace Nexplore.Practices.Serilog
{
    using System;
    using global::Serilog.Core;
    using global::Serilog.Events;

    /// <summary>
    /// This enricher enables the usage of the {MachineName} parameter in the log template.
    /// The parameter will be replaced by the name of the machine the application is running on.
    /// </summary>
    public class MachineNameEnricher : ILogEventEnricher
    {
        private const string MACHINE_NAME_PROPERTY_NAME = "MachineName";

        public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
        {
            logEvent.AddPropertyIfAbsent(new LogEventProperty(MACHINE_NAME_PROPERTY_NAME, new ScalarValue(Environment.MachineName)));
        }
    }
}
