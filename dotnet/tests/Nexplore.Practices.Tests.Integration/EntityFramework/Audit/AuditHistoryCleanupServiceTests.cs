namespace Nexplore.Practices.Tests.Integration.EntityFramework.Audit
{
    using System;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Autofac;
    using Microsoft.Extensions.Logging;
    using Nexplore.Practices.Core.Domain.Model.Audit;
    using Nexplore.Practices.Core.Domain.Model.Audit.Entities;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.EntityFramework.Services;
    using NUnit.Framework;

    [TestFixture]
    public class AuditHistoryCleanupServiceTests : ScopedTestsBase
    {
        private IUnitOfWorkFactory<IAuditHistoryRepository> unitOfWorkFactory;
        private AuditHistoryCleanupService auditHistoryCleanupService;

        [SetUp]
        public void Initialize()
        {
            this.unitOfWorkFactory = this.Scope.Resolve<IUnitOfWorkFactory<IAuditHistoryRepository>>();
            this.auditHistoryCleanupService = new AuditHistoryCleanupService(this.Scope.Resolve<ILogger<AuditHistoryCleanupService>>(), this.unitOfWorkFactory);
        }

        [Test]
        public async Task AuditLogHistoryCleanupService_DeletesCorrectHistoryEntries()
        {
            // Arrange
            var cutOffDate = DateTimeOffset.UtcNow.AddDays(-365);
            await this.CreateAuditHistoryAsync(cutOffDate.AddDays(-35), 400);

            // Assert
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var auditHistory = await unitOfWork.Dependent.LoadAuditHistoryAsync(DateTimeOffset.UtcNow.AddDays(-401), DateTimeOffset.UtcNow);

                Assert.That(auditHistory.Length, Is.EqualTo(400));
            }

            // Act
            await this.auditHistoryCleanupService.CleanupAsync(cutOffDate, CancellationToken.None);

            // Assert
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var auditHistory = await unitOfWork.Dependent.LoadAuditHistoryAsync(DateTimeOffset.UtcNow.AddDays(-401), DateTimeOffset.UtcNow);

                Assert.That(!auditHistory.Any(a => a.CreatedOn < cutOffDate), Is.True, "History entries found that should have been deleted.");
                Assert.That(auditHistory.Any(a => a.CreatedOn >= cutOffDate), Is.True, "History entries not found that should be found.");

                Assert.That(auditHistory.Length, Is.EqualTo(365));
            }
        }

        private async Task CreateAuditHistoryAsync(DateTimeOffset startDate, int days)
        {
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                var currentDate = startDate;
                for (var day = 0; day < days; day++)
                {
                    unitOfWork.Dependent.Add(new AuditHistory
                    {
                        EntityId = Guid.NewGuid().ToString(),
                        EntityType = "TestEntity",
                        OldValue = "Old",
                        NewValue = "New",
                        PropertyName = "Name",
                        PropertyType = "System.string",
                        ModificationType = "Update",
                        CreatedOn = currentDate,
                        CreatedBy = "System",
                        CreatedWith = "1.0.0",
                    });

                    currentDate = currentDate.AddDays(1);
                }

                await unitOfWork.SaveChangesAsync();
            }
        }
    }
}
