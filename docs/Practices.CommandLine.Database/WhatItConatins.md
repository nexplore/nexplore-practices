# What it contains

The library works as an addition to `Practices.CommandLine`. It contains commands to execute an EF migration with your custom CLI.  
Create your own implementation of `IDbManagementService` that executes the migration.

## Commands and Options

The following commands are currently available, shown in their hierarchy:

| Command            | Type              | Usage                                                                                               |
| ------------------ | ----------------- | --------------------------------------------------------------------------------------------------- |
| `database`         | `DatabaseCommand` | Groups commands that modify the database.                                                           |
| `database migrate` | `MigrateCommand`  | Migrates the database to the latest version using EF migrations and runs the configured generators. |
