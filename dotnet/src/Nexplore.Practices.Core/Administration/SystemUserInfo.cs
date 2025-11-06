namespace Nexplore.Practices.Core.Administration
{
    public class SystemUserInfo : IUserInfo
    {
        public string UserId => null;

        public string UserName => PracticesConstants.User.SYSTEM_NAME;
    }
}
