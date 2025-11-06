# User Info Resolving

You can resolve `IUser` in your code to get basic user information like a user id and name. If you have more or different user information in your project
you need to create a derived user info definition.

```
public interface IPlaygroundUser : IUser
{
    string FullName { get; }
}

public interface IPlaygroundUserInfo : IUserInfo
{
    string FirstName { get; }

    string LastName { get; }
}
```

Implement the user and user info in your project:

```
public class PlaygroundUser : SimpleUser, IPlaygroundUser
{
    private readonly IUserInfoResolver userInfoResolver;

    public PlaygroundUser(IUserInfoResolver userInfoResolver)
        : base(userInfoResolver)
    {
        this.userInfoResolver = userInfoResolver;
    }

    public string FullName
    {
        get
        {
            var firstName = this.userInfoResolver.Resolve<string, IPlaygroundUserInfo>(e => e.FirstName);
            var lastName = this.userInfoResolver.Resolve<string, IPlaygroundUserInfo>(e => e.LastName);

            return $"{firstName} {lastName}".Trim();
        }
    }
}

public class StaticUserInfo : IPlaygroundUserInfo
{
    public string UserId => null;

    public string UserName => "Anonymous";

    public string FirstName => "Nexplore";

    public string LastName => "AG";
}
```

Last but not least you need to register your user and user info object in the Autofac container:

```
builder.Register<IUserInfoResolver>(c => new UserInfoResolver(new StaticUserInfo(), new SystemUserInfo())).InstancePerLifetimeScope();
builder.RegisterType<PlaygroundUser>().As<IPlaygroundUser>().InstancePerLifetimeScope();
```
