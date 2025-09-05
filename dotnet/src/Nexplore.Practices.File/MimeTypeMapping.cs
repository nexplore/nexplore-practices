namespace Nexplore.Practices.File
{
    using System.Diagnostics.CodeAnalysis;
    using Microsoft.AspNetCore.StaticFiles;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core;
    using Nexplore.Practices.Core.Files;

    public class MimeTypeMapping : IMimeTypeMapping
    {
        [SuppressMessage("Naming", "CA1707:Identifiers should not contain underscores", Justification = "Legacy const naming rule.")]
        [SuppressMessage("ReSharper", "InconsistentNaming")]
        public const string DEFAULT_MIME_TYPE = "application/octet-stream";

        private readonly FileExtensionContentTypeProvider fileExtensionContentTypeProvider;
        private readonly ILogger<MimeTypeMapping> logger;

        public MimeTypeMapping(FileExtensionContentTypeProvider fileExtensionContentTypeProvider, ILogger<MimeTypeMapping> logger, IOptions<FileOptions> fileOptions)
        {
            this.fileExtensionContentTypeProvider = fileExtensionContentTypeProvider;
            this.logger = logger;

            foreach (var additionalMapping in fileOptions.Value.AdditionalMimeTypeMappings)
            {
                this.AddAdditionalMapping(additionalMapping.Key, additionalMapping.Value);
            }
        }

        public string GetContentTypeFromFileName(string fileName)
        {
            Guard.ArgumentNotNullOrEmpty(fileName, nameof(fileName));

            if (this.fileExtensionContentTypeProvider.TryGetContentType(fileName, out string contentType))
            {
                return contentType;
            }

            return DEFAULT_MIME_TYPE;
        }

        private void AddAdditionalMapping(string extension, string mimeType)
        {
            if (string.IsNullOrWhiteSpace(extension) || string.IsNullOrWhiteSpace(mimeType))
            {
                this.logger.LogWarning($"Invalid mime type mapping with for extension '{extension}' and mime type '{mimeType}'.");
                return;
            }

            if (!extension.StartsWith('.'))
            {
                extension = "." + extension;
            }

            if (!this.fileExtensionContentTypeProvider.Mappings.ContainsKey(extension))
            {
                this.fileExtensionContentTypeProvider.Mappings.Add(extension, mimeType);
            }
        }
    }
}
