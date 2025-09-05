namespace Nexplore.Practices.Mail
{
    using System;
    using System.IO;
    using System.Linq;
    using System.Text.RegularExpressions;
    using System.Threading;
    using System.Threading.Tasks;
    using MailKit.Net.Smtp;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using MimeKit;
    using MimeKit.IO;
    using MimeKit.Utils;
    using Nexplore.Practices.Core;

    public class MailService : IMailService
    {
        private static readonly Regex dataUriRegex = new Regex(@"""data:(\w+\/\w+);name=([^""]+);base64,([^""]+)""", RegexOptions.IgnoreCase | RegexOptions.Multiline);

        private readonly IOptions<MailOptions> mailOptions;
        private readonly ILogger<MailService> logger;

        public MailService(IOptions<MailOptions> mailOptions, ILogger<MailService> logger)
        {
            this.mailOptions = mailOptions;
            this.logger = logger;
        }

        public Task SendMailAsync(string subject, string contentAsPlain, string contentAsHtml, MailAddressInfo recipient, bool markAsImportant, CancellationToken cancellationToken)
        {
            return this.SendMailAsync(subject, contentAsPlain, contentAsHtml, new[] { recipient }, null, null, markAsImportant, cancellationToken);
        }

        public async Task SendMailAsync(
            string subject,
            string contentAsPlain,
            string contentAsHtml,
            MailAddressInfo[] recipientsTo,
            MailAddressInfo[] recipientsCc,
            MailAddressInfo[] recipientsBcc,
            bool markAsImportant,
            CancellationToken cancellationToken)
        {
            // Verify parameters
            VerifyContent(contentAsPlain, contentAsHtml);

            if (recipientsTo.Length == 0)
            {
                this.logger.LogWarning($"Email '{subject}' could not be sent because it has no recipients");
                return;
            }

            recipientsCc ??= Array.Empty<MailAddressInfo>();
            recipientsBcc ??= Array.Empty<MailAddressInfo>();

            // Logging
            var smtpEnabled = this.mailOptions.Value.UseSmtp;
            var pickupDirectoryEnabled = this.mailOptions.Value.UsePickupDirectory;

            this.Log(subject, recipientsTo, recipientsCc, recipientsBcc, smtpEnabled, pickupDirectoryEnabled);

            // Config verification
            if (!smtpEnabled && !pickupDirectoryEnabled)
            {
                this.logger.LogWarning("Neither SMTP nor Pickup Directory is enabled -> nothing happens with the e-mail");
                return;
            }

            this.VerifyConfiguration(smtpEnabled, pickupDirectoryEnabled);

            // Get the message
            var message = this.PrepareMailMessage(subject, contentAsPlain, contentAsHtml, recipientsTo, recipientsCc, recipientsBcc, markAsImportant);

            // Send email via SMTP server
            if (smtpEnabled)
            {
                await this.SendToSmtpServerAsync(message, cancellationToken).ConfigureAwait(false);
            }

            // Store email on file system
            if (pickupDirectoryEnabled)
            {
                await this.SaveToPickupDirectoryAsync(message, cancellationToken).ConfigureAwait(false);
            }
        }

        private static void VerifyContent(string contentAsPlain, string contentAsHtml)
        {
            if (string.IsNullOrWhiteSpace(contentAsPlain) && string.IsNullOrWhiteSpace(contentAsHtml))
            {
                throw new InvalidOperationException("Either content as plain or as html must be provided");
            }
        }

        private void Log(
            string subject,
            MailAddressInfo[] recipientsTo,
            MailAddressInfo[] recipientsCc,
            MailAddressInfo[] recipientsBcc,
            bool smtpEnabled,
            bool pickupDirectoryEnabled)
        {
            var recipientsLog = "To=" + string.Join(", ", recipientsTo.Select(r => r.ToString()));

            if (recipientsCc.Length != 0)
            {
                recipientsLog += " Cc=" + string.Join(", ", recipientsCc.Select(r => r.ToString()));
            }

            if (recipientsBcc.Length != 0)
            {
                recipientsLog += " Bcc=" + string.Join(", ", recipientsBcc.Select(r => r.ToString()));
            }

            this.logger.LogInformation($"Sending email '{subject}' ({recipientsLog} Smtp={smtpEnabled}, PickupDirectory={pickupDirectoryEnabled})");
        }

        private void VerifyConfiguration(bool smtpEnabled, bool pickupDirectoryEnabled)
        {
            Guard.NotNullOrEmpty(this.mailOptions.Value.SenderName, nameof(this.mailOptions.Value.SenderName));
            Guard.NotNullOrEmpty(this.mailOptions.Value.SenderEmail, nameof(this.mailOptions.Value.SenderEmail));

            if (smtpEnabled)
            {
                Guard.NotNullOrEmpty(this.mailOptions.Value.SmtpServerHost, nameof(this.mailOptions.Value.SmtpServerHost));
                Guard.Assert(this.mailOptions.Value.SmtpServerPort > 0, "this.mailOptions.Value.SmtpServerPort > 0");
            }

            if (pickupDirectoryEnabled)
            {
                Guard.NotNullOrEmpty(this.mailOptions.Value.PickupDirectoryPath, nameof(this.mailOptions.Value.PickupDirectoryPath));
            }
        }

        private MimeMessage PrepareMailMessage(
            string subject,
            string contentAsPlain,
            string contentAsHtml,
            MailAddressInfo[] recipientsTo,
            MailAddressInfo[] recipientsCc,
            MailAddressInfo[] recipientsBcc,
            bool markAsImportant)
        {
            var message = new MimeMessage();

            message.From.Add(new MailboxAddress(this.mailOptions.Value.SenderName, this.mailOptions.Value.SenderEmail));
            if (!string.IsNullOrWhiteSpace(this.mailOptions.Value.ReplyToEmail))
            {
                message.ReplyTo.Add(new MailboxAddress(this.mailOptions.Value.SenderName, this.mailOptions.Value.ReplyToEmail));
            }

            foreach (var recipient in recipientsTo)
            {
                message.To.Add(new MailboxAddress(recipient.Name, recipient.Email));
            }

            foreach (var recipient in recipientsCc)
            {
                message.Cc.Add(new MailboxAddress(recipient.Name, recipient.Email));
            }

            foreach (var recipient in recipientsBcc)
            {
                message.Bcc.Add(new MailboxAddress(recipient.Name, recipient.Email));
            }

            message.Subject = subject;

            var bodyBuilder = new BodyBuilder();

            if (!string.IsNullOrWhiteSpace(contentAsPlain))
            {
                bodyBuilder.TextBody = contentAsPlain;
            }

            if (!string.IsNullOrWhiteSpace(contentAsHtml))
            {
                bodyBuilder.HtmlBody = ExtractDataUrisToAttachments(bodyBuilder, contentAsHtml);
            }

            message.Body = bodyBuilder.ToMessageBody();

            if (markAsImportant)
            {
                message.Importance = MessageImportance.High;
            }

            return message;
        }

        private async Task SendToSmtpServerAsync(MimeMessage message, CancellationToken cancellationToken)
        {
            using (var client = new SmtpClient())
            {
                try
                {
                    await client.ConnectAsync(
                        this.mailOptions.Value.SmtpServerHost,
                        this.mailOptions.Value.SmtpServerPort,
                        this.mailOptions.Value.SmtpSecureSocketOptions,
                        cancellationToken).ConfigureAwait(false);

                    if (!string.IsNullOrWhiteSpace(this.mailOptions.Value.SmtpUsername))
                    {
                        await client.AuthenticateAsync(
                            this.mailOptions.Value.SmtpUsername,
                            this.mailOptions.Value.SmtpPassword,
                            cancellationToken).ConfigureAwait(false);
                    }

                    await client.SendAsync(message, cancellationToken).ConfigureAwait(false);
                }
                finally
                {
                    if (client.IsConnected)
                    {
                        await client.DisconnectAsync(true, cancellationToken).ConfigureAwait(false);
                    }
                }
            }
        }

        /// <summary>
        /// Sample implementation copied from https://github.com/jstedfast/MailKit/blob/master/FAQ.md#SpecifiedPickupDirectory.
        /// </summary>
        private async Task SaveToPickupDirectoryAsync(MimeMessage message, CancellationToken cancellationToken)
        {
            do
            {
                // Generate a random file name to save the message to.
                var path = Path.Combine(this.mailOptions.Value.PickupDirectoryPath, Guid.NewGuid() + ".eml");
                Stream stream;

                try
                {
                    // Attempt to create the new file.
                    stream = File.Open(path, FileMode.CreateNew);
                }
                catch (IOException)
                {
                    // If the file already exists, try again with a new Guid.
                    if (File.Exists(path))
                    {
                        continue;
                    }

                    // Otherwise, fail immediately since it probably means that there is
                    // no graceful way to recover from this error.
                    throw;
                }

                try
                {
                    using (stream)
                    {
                        // IIS pickup directories expect the message to be "byte-stuffed"
                        // which means that lines beginning with "." need to be escaped
                        // by adding an extra "." to the beginning of the line.
                        //
                        // Use an SmtpDataFilter "byte-stuff" the message as it is written
                        // to the file stream. This is the same process that an SmtpClient
                        // would use when sending the message in a `DATA` command.
                        using (var filtered = new FilteredStream(stream))
                        {
                            filtered.Add(new SmtpDataFilter());

                            // Make sure to write the message in DOS (<CR><LF>) format.
                            var options = FormatOptions.Default.Clone();
                            options.NewLineFormat = NewLineFormat.Dos;

                            await message.WriteToAsync(options, filtered, cancellationToken).ConfigureAwait(false);
                            await filtered.FlushAsync(cancellationToken).ConfigureAwait(false);
                            return;
                        }
                    }
                }
                catch
                {
                    // An exception here probably means that the disk is full.
                    //
                    // Delete the file that was created above so that incomplete files are not
                    // left behind for IIS to send accidentally.
                    File.Delete(path);
                    throw;
                }
            }
            while (true);
        }

        private static string ExtractDataUrisToAttachments(BodyBuilder bodyBuilder, string contentAsHtml)
        {
            return dataUriRegex.Replace(contentAsHtml, match =>
            {
                var mimeType = match.Groups[1].Value.Split('/');
                var fileName = match.Groups[2].Value;
                var base64 = match.Groups[3].Value;

                var imageContent = Convert.FromBase64String(base64);
                var stream = new MemoryStream(imageContent);

                var image = bodyBuilder.Attachments.Add(fileName, stream, new ContentType(mimeType[0], mimeType[1]));
                image.ContentId = MimeUtils.GenerateMessageId();

                return $@"""cid:{image.ContentId}""";
            });
        }
    }
}
