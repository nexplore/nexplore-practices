namespace Nexplore.Practices.CommandLine.Code
{
    using System;
    using System.IO;
    using System.Xml;
    using System.Xml.Linq;
    using Microsoft.Extensions.Logging;
    using Nexplore.Practices.CommandLine.Code.Exceptions;

    public class ResourceSorterService : IResourceSorterService
    {
        private readonly ILogger<ResourceSorterService> logger;

        public ResourceSorterService(ILogger<ResourceSorterService> logger)
        {
            this.logger = logger;
        }

        public void Validate(FileSystemInfo filePath)
        {
            this.logger.LogInformation("ResourceSorter is executing [validate]");
            this.Execute(filePath, true);
            this.logger.LogInformation("Validating resources successfully finished");
        }

        public void Sort(FileSystemInfo filePath)
        {
            this.logger.LogInformation("ResourceSorter is executing [sort]");
            this.Execute(filePath, false);
            this.logger.LogInformation("Sorting resources successfully finished");
        }

        private void Execute(FileSystemInfo rootPath, bool dryRun)
        {
            var filePaths = GetResxPaths(rootPath);

            foreach (var filePath in filePaths)
            {
                var inputDocument = LoadDocument(filePath);
                var sortedDocument = ResxSorter.Sort(inputDocument);

                if (inputDocument.Root == null || sortedDocument.Root == null)
                {
                    throw new DocumentSortingException($"Error sorting file '{filePath}'");
                }

                if (dryRun)
                {
                    if (!ResxSorter.IsSameOrder(inputDocument.Root, sortedDocument.Root))
                    {
                        throw new DocumentsUnequalException($"File '{filePath}' is not sorted");
                    }
                }
                else
                {
                    if (!ResxSorter.IsSame(inputDocument.Root, sortedDocument.Root))
                    {
                        throw new DocumentsUnequalException($"Unequal documents after sorting file '{filePath}'.");
                    }

                    sortedDocument.Save(filePath);

                    this.logger.LogInformation("Sorted Document saved to {FilePath}", filePath);
                }
            }
        }

        /// <summary>
        /// Get an array of paths to resx files from either a directory path or
        /// a file path.
        /// </summary>
        /// <param name="rootPath"></param>
        /// <returns></returns>
        private static string[] GetResxPaths(FileSystemInfo rootPath)
        {
            if (rootPath.Attributes.HasFlag(FileAttributes.Directory))
            {
                return Directory.GetFiles(rootPath.FullName, "*.resx", SearchOption.AllDirectories);
            }

            return new[] { rootPath.FullName };
        }

        /// <summary>
        /// Load a XDocument from a 'filePath'
        /// </summary>
        /// <param name="filePath"></param>
        /// <returns></returns>
        /// <exception cref="FormatException"></exception>
        /// <exception cref="FileLoadException"></exception>
        /// <exception cref="ArgumentNullException"></exception>
        private static XDocument LoadDocument(string filePath)
        {
            if (!Path.Exists(filePath))
            {
                throw new FileNotFoundException($"File '{filePath}' not found");
            }

            if (!filePath.EndsWith(@".resx", StringComparison.OrdinalIgnoreCase))
            {
                throw new FormatException($"Invalid file type '{filePath}'");
            }

            var inputReader = XmlReader.Create(filePath);
            var document = XDocument.Load(inputReader);

            inputReader.Close();

            if (document.Root == null)
            {
                throw new ArgumentNullException($"File '{filePath}' has no root");
            }

            return document;
        }
    }
}
