namespace Nexplore.Practices.Core.ChangeTracking
{
    using System.Reflection;

    public class ChangedPropertyInfo
    {
        public string PropertyName { get; set; }

        public string PropertyFullName { get; set; }

        public PropertyInfo PropertyInfo { get; set; }
    }
}
