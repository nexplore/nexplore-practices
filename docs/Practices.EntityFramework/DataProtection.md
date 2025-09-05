# Data Protection Api

Practices is prepared to store the keys for the [data protection api](https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/using-data-protection) in the database. There is some configuration needed to enable this in your project.

## Enable Data Protection

You need to enable the data protection api in general. You do this in the `Startup` class or in any other related bootstrapper.

```
public IServiceProvider ConfigureServices(IServiceCollection services)
{
     ...

     services.AddDataProtection().SetApplicationName("<application name>);

     ...
}
```

The application name must be configured if your application needs to share the cookie with multiple instances of the application.

## Create Database Table

As the keys are stored in the database, you need to create a mapping for `DataProtectionKey` entity. The entity type as well as the configuration for it comes from Entity Framework Core.

```
internal class DataProtectionKeyMapping : IEntityTypeConfiguration<DataProtectionKey>
{
    public void Configure(EntityTypeBuilder<DataProtectionKey> builder)
    {
    }
}
```

Don't forget to create a migration to add the new table.

## Configure Storage Repository

In the `Registry` of your database access infrastructure project, you need to configure the repository to store and load the keys from the database. There is an extension method available in Practices:

```
namespace <Project>.Infrastructure.DbAccess
{
    using Autofac;
    using Nexplore.Practices.EntityFramework.Extensions;

    public class Registry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            ...

            builder.PersistDataProtectionKeysInDb();

            ...
        }
    }
}
```

## Configure Encryption Password

The protection keys are encrypted with a password. The password should be configured in the `appsettings.json` of your project. Be sure to configure the same password for all environments which should be able to share the protection key.

```
...

"Database": {
  "DataProtectionEncryptionPassword": "<strong password>"
}

...
```

### Caution

When changing the password, it will not be possible to decrypt values anymore which have been encrypted with the old password.

It is also important to keep the password as safe as possible. Avoid storing the password in a source control repository or in any other plain text format and follow the security guidelines of your projects (e.g. `appsettings.override.json`).