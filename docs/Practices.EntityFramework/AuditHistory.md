# Audit History

Practices provides an audit log that logs EF changes in an audit table.

Restrictions:
- Changes that are applied via direct SQL statements are not logged.
- Changes made directly in the database (for example via triggers or stored procedures) are not logged.

Owned Types:
Audit history supports 1:1 owned types (and recursively owned types of owned types).

WARNING: Owned collections are not supported. It is recommended to use regular entities for 1:n relations.

## Enable Audit History

1. Implement IAuditable for entities you want to audit (usally that's implemented on your EntityBase).

2. Enable or disable audit log via configuration
Set Audit.Enabled to true/false via configuration (see chapter below)

3. Create Table
DbModelCreator will automatically add the mapping configuration for the audit history table if Enabled is true (see method ConfigureFromOptions).
Don't forget to create a migration to add the new table. 

## Configuration

The audit log offers these options:

Enabled 
Activate / deactivate the audit log
default: false

ExcludedProperties
You can exclude certain properties from being logged.

ExcludedTypes
You can exlude certain types from being logged.

```
...

"Audit": {
  "Enabled": true/false,
  "ExcludedProperties": [ "Id", "Timestamp", "ModifiedOn", "ModifiedBy", "ModifiedWith" ],
  "ExcludedTypes": [ "Nexplore.Namespace.ExcludedEntity, Nexplore.Assembly, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null" ]
}

...
```

## Cleanup

You can use the IAuditHistoryCleanupService service to remove old audit history entries from the database.
