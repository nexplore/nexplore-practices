# Installation

To correctly initialize the library you need to register the module in your Autofac Container Builder:

```csharp
...

builder.RegisterModule<Practices.Mail.Registry>();

...
```

## Configuration

You need to configure the mail options in your `appsettings.json`

```
...

"Mail": {
  ...
}

...
```

The following configurations are available:

| Property                | Description                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| SenderName              | The name of the sender, e.g. "John Doe".                                                                                     |
| SenderEmail             | Email address of the sender, e.g. "john@doe.com".                                                                            |
| ReplyToEmail            | Reply to email address. Defaults to the sender email.                                                                        |
| UseSmtp                 | `true` for sending emails via SMTP.                                                                                          |
| SmtpServerHost          | SMTP server host address (required if `UseSmtp=true`).                                                                       |
| SmtpServerPort          | SMTP server port (required if `UseSmtp=true`).                                                                               |
| SmtpSecureSocketOptions | SMTP server secure socket options (`None`, `Auto`, `SslOnConnect`, `StartTls`, `StartTlsWhenAvailable`). Defaults to `Auto`. |
| SmtpUsername            | Username for SMTP server authentication (optional).                                                                          |
| SmtpPassword            | Password für SMTP server authentication (optional).                                                                          |
| UsePickupDirectory      | `true` if a copy of the email should be stored on the file system.                                                           |
| PickupDirectoryPath     | Path where the email should be stored on the file system (required if `UsePickupDirectory=true`).                            |

**Warning**: Keep in mind to never check in credentials to the source code repository. Better use the `appsettings.override.json` or any other approach.

## Best Practices

It is recommended to use `UseSmtp` only on the production system and use `UsePickupDirectory` on all other systems. This way it is guaranteed that productive users never get an email from a test system.
