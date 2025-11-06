namespace Nexplore.Practices.Mail
{
    public class MailAddressInfo
    {
        public MailAddressInfo(string name, string email)
        {
            this.Name = name;
            this.Email = email;
        }

        public string Name { get; }

        public string Email { get; }

        public override string ToString()
        {
            return $"{this.Name} <{this.Email}>";
        }
    }
}
