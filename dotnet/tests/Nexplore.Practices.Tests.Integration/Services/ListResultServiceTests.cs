namespace Nexplore.Practices.Tests.Integration.Services
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Autofac;
    using Nexplore.Practices.Core.Domain;
    using Nexplore.Practices.Core.Query.Objects;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Domain.Test;
    using Nexplore.Practices.Tests.Integration.Bootstrap.Services;
    using NUnit.Framework;

    [TestFixture]
    public class ListResultServiceTests : ScopedTestsBase
    {
        private IUnitOfWorkFactory<ITestRepository, IListResultService> unitOfWorkFactory;
        private List<Guid> createdTestEntityGuids;

        [SetUp]
        public void Initialize()
        {
            this.createdTestEntityGuids = new List<Guid>();
            this.unitOfWorkFactory = this.Scope.Resolve<IUnitOfWorkFactory<ITestRepository, IListResultService>>();
        }

        [TearDown]
        public async Task CleanUp()
        {
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                foreach (var createdTestEntityId in this.createdTestEntityGuids)
                {
                    var entity = await unitOfWork.Dependent.GetByIdOrDefaultAsync(createdTestEntityId);
                    if (entity != null)
                    {
                        unitOfWork.Dependent.Remove(entity);
                        await unitOfWork.SaveChangesAsync();
                    }
                }
            }
        }

        [Test]
        public async Task GetListResultWithProjection_WithEmptyQueryParams_ReturnsCorrectListEntry()
        {
            // Arrange
            await this.CreateAndCommitTestEntites(1);

            var queryParams = new QueryParams { IncludeTotal = true };

            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Act
                var listResult = await unitOfWork.Dependent2.GetListResultWithProjection(queryParams);

                // Assert
                Assert.That(listResult.Data.First().FirstName, Is.EqualTo("Test FirstName 1"));
                Assert.That(listResult.Data.First().LastName, Is.EqualTo("Test LastName 1"));
            }
        }

        [Test]
        public async Task GetListResultWithProjection_WithNoIncludeTotal_ReturnsNullForTotal()
        {
            // Arrange
            await this.CreateAndCommitTestEntites(1);

            var queryParams = new QueryParams { IncludeTotal = false };

            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Act
                var listResult = await unitOfWork.Dependent2.GetListResultWithProjection(queryParams);

                // Assert
                Assert.That(listResult.Total, Is.Null);
            }
        }

        [Test]
        public async Task GetListResultWithProjection_WithIncludeTotal_ReturnsCorrectTotalCount()
        {
            // Arrange
            await this.CreateAndCommitTestEntites(3);

            var queryParams = new QueryParams { IncludeTotal = true };

            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Act
                var listResult = await unitOfWork.Dependent2.GetListResultWithProjection(queryParams);

                // Assert
                Assert.That(listResult.Total, Is.EqualTo(3));
            }
        }

        [Test]
        public async Task GetListResultWithProjection_WithSkipTakeValues_ReturnsCorrectResult()
        {
            // Arrange
            await this.CreateAndCommitTestEntites(2);

            var queryParams = new QueryParams
            {
                Orderings = { new Ordering { Direction = OrderDirection.Asc, Field = "FirstName" } },
                IncludeTotal = true,
                Skip = 1,
                Take = 1,
            };

            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Act
                var listResult = await unitOfWork.Dependent2.GetListResultWithProjection(queryParams);

                // Assert
                Assert.That(listResult.Total, Is.EqualTo(2));
                Assert.That(listResult.Data.Count, Is.EqualTo(1));
                Assert.That(listResult.Data.First().FirstName, Is.EqualTo("Test FirstName 2"));
                Assert.That(listResult.Data.First().LastName, Is.EqualTo("Test LastName 2"));
            }
        }

        [TestCase(OrderDirection.Asc, "Test FirstName 1", "Test FirstName 2")]
        [TestCase(OrderDirection.Desc, "Test FirstName 2", "Test FirstName 1")]
        public async Task GetListResultWithProjection_WithOrdering_ReturnsResultsInCorrectOrder(OrderDirection orderDirection, string expectedFirstResultFirstName, string expectedSecondResultFirstName)
        {
            // Arrange
            await this.CreateAndCommitTestEntites(2);

            var queryParams = new QueryParams
            {
                Orderings = { new Ordering { Direction = orderDirection, Field = "FirstName" } },
            };

            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Act
                var listResult = await unitOfWork.Dependent2.GetListResultWithProjection(queryParams);

                // Assert
                Assert.That(listResult.Data.First().FirstName, Is.EqualTo(expectedFirstResultFirstName));
                Assert.That(listResult.Data.Skip(1).First().FirstName, Is.EqualTo(expectedSecondResultFirstName));
            }
        }

        [Test]
        public async Task GetListResultWithInMemoryMapping_WithEmptyQueryParams_ReturnsCorrectListEntry()
        {
            // Arrange
            await this.CreateAndCommitTestEntites(1);

            var queryParams = new QueryParams { IncludeTotal = true };

            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Act
                var listResult = await unitOfWork.Dependent2.GetListResultWithInMemoryMapping(queryParams);

                // Assert
                Assert.That(listResult.Data.First().FirstName, Is.EqualTo("Test FirstName 1 Mapped"));
                Assert.That(listResult.Data.First().LastName, Is.EqualTo("Test LastName 1 Mapped"));
            }
        }

        [Test]
        public async Task GetSyncListResultWithProjection_WithEmptyQueryParams_ReturnsCorrectListEntry()
        {
            // Arrange
            await this.CreateAndCommitTestEntites(1);

            var queryParams = new QueryParams { IncludeTotal = true };

            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Act
                var listResult = await unitOfWork.Dependent2.GetSyncListResultWithProjection(queryParams);

                // Assert
                Assert.That(listResult.Data.First().FirstName, Is.EqualTo("Test FirstName 1"));
                Assert.That(listResult.Data.First().LastName, Is.EqualTo("Test LastName 1"));
            }
        }

        [Test]
        public async Task GetSyncListResultWithProjection_WithNoIncludeTotal_ReturnsNullForTotal()
        {
            // Arrange
            await this.CreateAndCommitTestEntites(1);

            var queryParams = new QueryParams { IncludeTotal = false };

            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Act
                var listResult = await unitOfWork.Dependent2.GetSyncListResultWithProjection(queryParams);

                // Assert
                Assert.That(listResult.Total, Is.Null);
            }
        }

        [Test]
        public async Task GetSyncListResultWithProjection_WithIncludeTotal_ReturnsCorrectTotalCount()
        {
            // Arrange
            await this.CreateAndCommitTestEntites(3);

            var queryParams = new QueryParams { IncludeTotal = true };

            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Act
                var listResult = await unitOfWork.Dependent2.GetSyncListResultWithProjection(queryParams);

                // Assert
                Assert.That(listResult.Total, Is.EqualTo(3));
            }
        }

        [Test]
        public async Task GetSyncListResultWithProjection_WithSkipTakeValues_ReturnsCorrectResult()
        {
            // Arrange
            await this.CreateAndCommitTestEntites(2);

            var queryParams = new QueryParams
            {
                Orderings = { new Ordering { Direction = OrderDirection.Asc, Field = "FirstName" } },
                IncludeTotal = true,
                Skip = 1,
                Take = 1,
            };

            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Act
                var listResult = await unitOfWork.Dependent2.GetSyncListResultWithProjection(queryParams);

                // Assert
                Assert.That(listResult.Total, Is.EqualTo(2));
                Assert.That(listResult.Data.Count, Is.EqualTo(1));
                Assert.That(listResult.Data.First().FirstName, Is.EqualTo("Test FirstName 2"));
                Assert.That(listResult.Data.First().LastName, Is.EqualTo("Test LastName 2"));
            }
        }

        [TestCase(OrderDirection.Asc, "Test FirstName 1", "Test FirstName 2")]
        [TestCase(OrderDirection.Desc, "Test FirstName 2", "Test FirstName 1")]
        public async Task GetSyncListResultWithProjection_WithOrdering_ReturnsResultsInCorrectOrder(OrderDirection orderDirection, string expectedFirstResultFirstName, string expectedSecondResultFirstName)
        {
            // Arrange
            await this.CreateAndCommitTestEntites(2);

            var queryParams = new QueryParams
            {
                Orderings = { new Ordering { Direction = orderDirection, Field = "FirstName" } },
            };

            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Act
                var listResult = await unitOfWork.Dependent2.GetSyncListResultWithProjection(queryParams);

                // Assert
                Assert.That(listResult.Data.First().FirstName, Is.EqualTo(expectedFirstResultFirstName));
                Assert.That(listResult.Data.Skip(1).First().FirstName, Is.EqualTo(expectedSecondResultFirstName));
            }
        }

        [Test]
        public async Task GetSyncListResultWithInMemoryMapping_WithEmptyQueryParams_ReturnsCorrectListEntry()
        {
            // Arrange
            await this.CreateAndCommitTestEntites(1);

            var queryParams = new QueryParams { IncludeTotal = true };

            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                // Act
                var listResult = await unitOfWork.Dependent2.GetSyncListResultWithInMemoryMapping(queryParams);

                // Assert
                Assert.That(listResult.Data.First().FirstName, Is.EqualTo("Test FirstName 1 Mapped"));
                Assert.That(listResult.Data.First().LastName, Is.EqualTo("Test LastName 1 Mapped"));
            }
        }

        private async Task CreateAndCommitTestEntites(int amount)
        {
            using (var unitOfWork = this.unitOfWorkFactory.Begin())
            {
                for (var i = 1; i <= amount; i++)
                {
                    var entity = unitOfWork.Dependent.CreateAndAdd();
                    entity.FirstName = $"Test FirstName {i}";
                    entity.LastName = $"Test LastName {i}";

                    this.createdTestEntityGuids.Add(entity.Id);
                }

                await unitOfWork.SaveChangesAsync();
            }
        }
    }
}
