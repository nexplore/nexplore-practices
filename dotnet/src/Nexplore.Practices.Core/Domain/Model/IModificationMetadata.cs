namespace Nexplore.Practices.Core.Domain.Model
{
    using System;

    public interface IModificationMetadata
    {
        string CreatedBy { get; set; }

        DateTimeOffset CreatedOn { get; set; }

        string CreatedWith { get; set; }

        string ModifiedBy { get; set; }

        DateTimeOffset? ModifiedOn { get; set; }

        string ModifiedWith { get; set; }
    }
}
