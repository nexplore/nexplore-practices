namespace Nexplore.Practices.EntityFramework.Metadata
{
    public interface IEntityMetadataProvider
    {
        void SetTimestampValueAsOriginalValueOnChangedEntities();

        void SetModifierMetadataOnChangedEntities();
    }
}
