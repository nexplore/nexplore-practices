namespace Nexplore.Practices.Core.Exceptions
{
    using Nexplore.Practices.Core.Localization;

    public class EntityNotFoundException : BusinessException
    {
        public EntityNotFoundException()
            : base(typeof(PracticesResourceNames), PracticesResourceNames.ENTITY_NOT_FOUND_EXCEPTION)
        {
        }
    }
}
