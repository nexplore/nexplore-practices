namespace Nexplore.Practices.Web.Localization
{
    using System;

    public class RewriteResourceTypeConfig
    {
        public string RewriteFrom { get; init; }

        public string RewriteTo { get; init; }

        public string FallbackTo { get; init; }

        public Type RewriteToAsType() => Type.GetType(this.RewriteTo);

        public Type FallbackToAsType() => !string.IsNullOrWhiteSpace(this.FallbackTo) ? Type.GetType(this.FallbackTo) : null;

        public override string ToString()
        {
            return $"RewriteFrom={this.RewriteFrom}, RewriteTo={this.RewriteTo}, FallbackTo={this.FallbackTo}";
        }
    }
}
