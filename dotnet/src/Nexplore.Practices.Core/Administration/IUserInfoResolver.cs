namespace Nexplore.Practices.Core.Administration
{
    using System;

    public interface IUserInfoResolver
    {
        TType Resolve<TType, TUserInfo>(Func<TUserInfo, TType> propertySelector)
            where TType : class
            where TUserInfo : IUserInfo;

        TType? Resolve<TType, TUserInfo>(Func<TUserInfo, TType?> propertySelector)
            where TType : struct
            where TUserInfo : IUserInfo;

        IDisposable Impersonate(IUserInfo userInfo);
    }
}
