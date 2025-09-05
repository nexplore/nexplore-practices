namespace Nexplore.Practices.Tests.Unit.Configuration
{
    using System;
    using System.IO;
    using Microsoft.Extensions.Configuration;
    using Nexplore.Practices.Configuration;
    using NUnit.Framework;

    [TestFixture]
    public class ConfigurationFactoryTests
    {
        [OneTimeSetUp]
        public void OneTimeSetup()
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");
        }

        [Test]
        public void Configure_Loads_WithSingleAppsettings()
        {
            // Arrange
            const string settingsFilesFolderName = "WithSingleAppsettings";
            var basePath = AppContext.BaseDirectory;

            CopyTestDataFolderToOutput(settingsFilesFolderName);

            // Act
            var factory = ConfigurationFactory.Create(basePath: Path.Combine(basePath, settingsFilesFolderName));
            var result = factory.GetValue<int>("Test:SimpleValue");

            // Assert
            Assert.That(result, Is.EqualTo(1));
        }

        [Test]
        public void Configure_Loads_FromOverrideAppsettings()
        {
            // Arrange
            const string settingsFilesFolderName = "WithOverride";
            var basePath = AppContext.BaseDirectory;

            CopyTestDataFolderToOutput(settingsFilesFolderName);

            // Act
            var factory = ConfigurationFactory.Create(basePath: Path.Combine(basePath, settingsFilesFolderName));
            var result = factory.GetValue<int>("Test:SimpleValue");

            // Assert
            Assert.That(result, Is.EqualTo(3));
        }

        [Test]
        public void Configure_Loads_FromOverrideAppsettingsEvenWithExistingEnvironmentSpecific()
        {
            // Arrange
            const string settingsFilesFolderName = "WithOverride";
            var basePath = AppContext.BaseDirectory;

            CopyTestDataFolderToOutput(settingsFilesFolderName);

            // Act
            var factory = ConfigurationFactory.Create(basePath: Path.Combine(basePath, settingsFilesFolderName));
            var result = factory.GetValue<int>("Test:SimpleValue");

            // Assert
            Assert.That(result, Is.EqualTo(3));
        }

        [TestCase("Development", 2)]
        [TestCase("Production", 4)]
        public void Configure_Loads_FromEnvironmentSpecificAppsettings(string environmentName, int expectedValue)
        {
            // Arrange
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", environmentName);
            const string settingsFilesFolderName = "WithoutOverride";
            var basePath = AppContext.BaseDirectory;

            CopyTestDataFolderToOutput(settingsFilesFolderName);

            // Act
            var factory = ConfigurationFactory.Create(basePath: Path.Combine(basePath, settingsFilesFolderName));
            var result = factory.GetValue<int>("Test:SimpleValue");

            // Assert
            Assert.That(result, Is.EqualTo(expectedValue));
        }

        private static void CopyTestDataFolderToOutput(string srcTestDataFolderName)
        {
            var basePath = AppContext.BaseDirectory;
            var sourcePath = Path.Combine(basePath, "../../../Configuration/TestData/", srcTestDataFolderName);
            var targetPath = Path.Combine(basePath, srcTestDataFolderName);

            Directory.CreateDirectory(targetPath);

            foreach (var file in Directory.GetFiles(sourcePath, "*.*", SearchOption.TopDirectoryOnly))
            {
                File.Copy(file, file.Replace(sourcePath, targetPath, StringComparison.Ordinal), true);
            }
        }
    }
}
