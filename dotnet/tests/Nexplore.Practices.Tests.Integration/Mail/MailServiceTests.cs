namespace Nexplore.Practices.Tests.Integration.Mail
{
    using System.Threading;
    using MailKit.Security;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Mail;
    using NSubstitute;
    using NUnit.Framework;

    [TestFixture]
    public class MailServiceTests
    {
        [Test]
        [Ignore("Manual tests -> If you want to execute the test, verify the mail settings within the test first")]
        public void SendEmail_WithFullConfiguration_SendsEmailAndStoresOnFilesystem()
        {
            // Arrange
            var mailOptions = Substitute.For<IOptions<MailOptions>>();
            mailOptions.Value.Returns(new MailOptions
            {
                SenderName = "Practices Unit Test Sender",
                SenderEmail = "noreply.practices@nexplore.ch",
                ReplyToEmail = "reply.practices@nexplore.ch",
                UsePickupDirectory = true,
                PickupDirectoryPath = @"C:\Temp\Mails",
                UseSmtp = true,
                SmtpServerHost = "mail.nexplore.ch",
                SmtpServerPort = 25,
                SmtpSecureSocketOptions = SecureSocketOptions.None,
            });

            var logger = Substitute.For<ILogger<MailService>>();

            var subject = "Hello from Unit Test";
            var contentAsPlain = "This is the plain text version";
            var contentAsHtml = "<h1>Hi</h1><p>This is the <strong>HTML</strong> version.</p>";
            var recipient = new MailAddressInfo("Practices Unit Test Recipient", "practices@nexplore.ch");

            var service = new MailService(mailOptions, logger);

            // Act
            AsyncTestDelegate act = async () => await service.SendMailAsync(subject, contentAsPlain, contentAsHtml, recipient, false, CancellationToken.None);

            // Assert
            Assert.That(act, Throws.Nothing);
        }
    }
}
