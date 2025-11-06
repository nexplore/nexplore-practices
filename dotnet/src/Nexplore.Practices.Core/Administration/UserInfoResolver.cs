namespace Nexplore.Practices.Core.Administration
{
    using System;
    using System.Collections.Generic;

    public class UserInfoResolver : IUserInfoResolver
    {
        private readonly Stack<IUserInfo> userInfoStack = new Stack<IUserInfo>();
        private readonly IUserInfo fallbackUserInfo;

        public UserInfoResolver(IUserInfo defaultUserInfo, IUserInfo fallbackUserInfo = null)
        {
            this.userInfoStack.Push(defaultUserInfo);
            this.fallbackUserInfo = fallbackUserInfo;
        }

        public TType Resolve<TType, TUserInfo>(Func<TUserInfo, TType> propertySelector)
            where TType : class
            where TUserInfo : IUserInfo
        {
            var value = propertySelector(this.GetCurrentUserInfo<TUserInfo>());
            if (value == null)
            {
                var fallback = this.GetFallbackUserInfo<TUserInfo>();
                if (fallback != null)
                {
                    value = propertySelector(fallback);
                }
            }

            return value;
        }

        public TType? Resolve<TType, TUserInfo>(Func<TUserInfo, TType?> propertySelector)
            where TType : struct
            where TUserInfo : IUserInfo
        {
            var value = propertySelector(this.GetCurrentUserInfo<TUserInfo>());
            if (value == null)
            {
                var fallback = this.GetFallbackUserInfo<TUserInfo>();
                if (fallback != null)
                {
                    value = propertySelector(fallback);
                }
            }

            return value;
        }

        public IDisposable Impersonate(IUserInfo userInfo)
        {
            Guard.ArgumentNotNull(userInfo, nameof(userInfo));

            this.userInfoStack.Push(userInfo);

            return Disposable.Create(() =>
            {
                this.userInfoStack.Pop();
            });
        }

        private TUserInfo GetCurrentUserInfo<TUserInfo>()
            where TUserInfo : IUserInfo
        {
            var userInfo = this.userInfoStack.Peek();
            Guard.InstanceIsAssignable(typeof(TUserInfo), userInfo, nameof(userInfo));

            return (TUserInfo)userInfo;
        }

        private TUserInfo GetFallbackUserInfo<TUserInfo>()
            where TUserInfo : IUserInfo
        {
            if (this.fallbackUserInfo == null)
            {
                return default(TUserInfo);
            }

            Guard.InstanceIsAssignable(typeof(TUserInfo), this.fallbackUserInfo, nameof(this.fallbackUserInfo));

            return (TUserInfo)this.fallbackUserInfo;
        }
    }
}
