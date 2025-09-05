namespace Nexplore.Practices.Mail
{
    using MailKit.Security;

    public class MailOptions
    {
        public const string NAME = "Mail";

        public string SenderName { get; set; }

        public string SenderEmail { get; set; }

        public string ReplyToEmail { get; set; }

        public bool UseSmtp { get; set; }

        public string SmtpServerHost { get; set; }

        public int SmtpServerPort { get; set; }

        public string SmtpUsername { get; set; }

        public string SmtpPassword { get; set; }

        public SecureSocketOptions SmtpSecureSocketOptions { get; set; } = SecureSocketOptions.Auto;

        public bool UsePickupDirectory { get; set; }

        public string PickupDirectoryPath { get; set; }
    }
}
