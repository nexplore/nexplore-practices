namespace Nexplore.Practices.Core.Administration
{
    public class SimpleUser : IUser
    {
        private readonly IUserInfoResolver userInfoResolver;

        public SimpleUser(IUserInfoResolver userInfoResolver)
        {
            this.userInfoResolver = userInfoResolver;
        }

        public string UserId => this.userInfoResolver.Resolve<string, IUserInfo>(e => e.UserId);

        public string UserName => this.userInfoResolver.Resolve<string, IUserInfo>(e => e.UserName);
    }
}
