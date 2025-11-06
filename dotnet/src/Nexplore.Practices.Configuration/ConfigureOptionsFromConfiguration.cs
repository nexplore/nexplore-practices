namespace Nexplore.Practices.Configuration
{
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Options;

    public class ConfigureOptionsFromConfiguration<TOptions> : IConfigureNamedOptions<TOptions>
        where TOptions : class
    {
        private readonly string optionsName;
        private readonly IConfiguration config;

        public ConfigureOptionsFromConfiguration(string optionsName, IConfiguration config)
        {
            this.optionsName = optionsName;
            this.config = config;
        }

        public void Configure(TOptions options)
        {
            this.Configure(this.optionsName, options);
        }

        public void Configure(string name, TOptions options)
        {
            if (name == Options.DefaultName)
            {
                name = this.optionsName;
            }

            this.config.Bind(name, options);
        }
    }
}
