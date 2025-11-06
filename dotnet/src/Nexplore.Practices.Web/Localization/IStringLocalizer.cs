namespace Nexplore.Practices.Web.Localization
{
    using Microsoft.Extensions.Localization;

    public interface IStringLocalizer<out TSource, out TFallback> : IStringLocalizer
    {
    }
}
