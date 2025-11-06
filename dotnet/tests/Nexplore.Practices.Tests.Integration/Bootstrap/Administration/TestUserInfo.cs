namespace Nexplore.Practices.Tests.Integration.Bootstrap.Administration
{
    using Nexplore.Practices.Core.Administration;

    public class TestUserInfo : IUserInfo
    {
        public string UserId => null;

        public string UserName => "Integration Test";
    }
}
