namespace Nexplore.Practices.Core.ChangeTracking
{
    public class PropertyWithChanges
    {
        public string PropertyName { get; set; }

        public object OldValue { get; set; }

        public object NewValue { get; set; }
    }
}
