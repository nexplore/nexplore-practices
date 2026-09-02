namespace Nexplore.Practices.CommandLine.Database.Commands
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Nexplore.Practices.CommandLine.Attributes;
    using Nexplore.Practices.CommandLine.Commands;

#pragma warning disable CA1010
    [HasParentCliCommand(typeof(DatabaseCommand))]
    public class MigrateCommand : CliCommandBase
    {
        private readonly Func<IDbManagementService> dbManagementService;

        public MigrateCommand(Func<IDbManagementService> dbManagementService)
            : base("migrate", "Creates the database if not exists and migrates any to the latest version using ef migrations")
        {
            this.dbManagementService = dbManagementService;
        }

        protected override async Task<int> ExecuteAsync(CancellationToken cancellationToken)
        {
            await this.dbManagementService().MigrateAsync().ConfigureAwait(false);

            return 0;
        }
    }
}
#pragma warning restore CA1010
