namespace Nexplore.Practices.Serilog
{
    using global::Serilog;
    using Microsoft.Extensions.Configuration;
    using Nexplore.Practices.Core;

    public class SerilogLoggerBuilder : ILoggerBuilder
    {
        private readonly IConfiguration configuration;
        private readonly CorrelationIdEnricher correlationIdEnricher;
        private readonly MachineNameEnricher machineNameEnricher;
        private readonly UserIdEnricher userIdEnricher;

        public SerilogLoggerBuilder(IConfiguration configuration, CorrelationIdEnricher correlationIdEnricher, MachineNameEnricher machineNameEnricher, UserIdEnricher userIdEnricher)
        {
            this.configuration = configuration;
            this.correlationIdEnricher = correlationIdEnricher;
            this.machineNameEnricher = machineNameEnricher;
            this.userIdEnricher = userIdEnricher;
        }

        protected virtual bool UseProcessIdEnricher => true;

        protected virtual bool UseCorrelationIdEnricher => true;

        protected virtual bool UseMachineNameEnricher => true;

        protected virtual bool UseUserIdEnricher => true;

        public void BuildLogger()
        {
            var config = new LoggerConfiguration()
                .ReadFrom.Configuration(this.configuration);
            config = this.AddEnrichers(config);

            Log.Logger = config.CreateLogger();
        }

        public void CloseAndFlush()
        {
            Log.CloseAndFlush();
        }

        protected virtual LoggerConfiguration AddCustomEnrichers(LoggerConfiguration config)
        {
            return config;
        }

        private LoggerConfiguration AddEnrichers(LoggerConfiguration config)
        {
            if (this.UseProcessIdEnricher)
            {
                config = config.Enrich.WithProcessId();
            }

            if (this.UseCorrelationIdEnricher && this.correlationIdEnricher != null)
            {
                config = config.Enrich.With(this.correlationIdEnricher);
            }

            if (this.UseMachineNameEnricher && this.machineNameEnricher != null)
            {
                config = config.Enrich.With(this.machineNameEnricher);
            }

            if (this.UseUserIdEnricher && this.userIdEnricher != null)
            {
                config = config.Enrich.With(this.userIdEnricher);
            }

            config = this.AddCustomEnrichers(config);

            return config;
        }
    }
}
