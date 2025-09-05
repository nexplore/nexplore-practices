namespace Nexplore.Practices.Mail
{
    using System.Threading;
    using System.Threading.Tasks;

    public interface IMailService
    {
        Task SendMailAsync(
            string subject,
            string contentAsPlain,
            string contentAsHtml,
            MailAddressInfo recipient,
            bool markAsImportant = false,
            CancellationToken cancellationToken = default);

        Task SendMailAsync(
            string subject,
            string contentAsPlain,
            string contentAsHtml,
            MailAddressInfo[] recipientsTo,
            MailAddressInfo[] recipientsCc = null,
            MailAddressInfo[] recipientsBcc = null,
            bool markAsImportant = false,
            CancellationToken cancellationToken = default);
    }
}
