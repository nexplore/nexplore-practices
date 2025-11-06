namespace Nexplore.Practices.Tests.Unit.Web.Exception
{
    using System;
    using System.Net;
    using System.Net.Http;
    using System.Runtime.CompilerServices;
    using System.Security;
    using System.Text.Json;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.DependencyInjection;
    using Nexplore.Practices.Core.Exceptions;
    using Nexplore.Practices.Core.Validation;
    using Nexplore.Practices.Web.Dtos.Errors;
    using Nexplore.Practices.Web.ExceptionHandler;
    using NUnit.Framework;
    using NUnit.Framework.Internal;

    [TestFixture]
    public class ExceptionHandlerTests : ExceptionTestsBase
    {
        protected override void AddServices(IServiceCollection services)
        {
            base.AddServices(services);

            services.AddProblemDetails();
            services.AddNexploreExceptionHandlers();
        }

        protected override void Configure(WebApplication app)
        {
            base.Configure(app);

            app.UseExceptionHandler("/error");
            this.MapEndpoints(app);
        }

        protected override async Task AddOrAssertSnapshotAsync(HttpResponseMessage response, HttpStatusCode statusCode, [CallerMemberName] string testName = null)
        {
#if NET8_0
            testName += "_dotnet8";
#endif
            await base.AddOrAssertSnapshotAsync(response, statusCode, testName);
        }

        protected virtual void MapEndpoints(WebApplication app)
        {
            app.MapGet(Endpoints.EntityNotFoundException, () =>
            {
                throw new EntityNotFoundException();
            });
            app.MapGet(Endpoints.EntityValidationException, () =>
            {
                var errors = new[]
                {
                    new EntityValidationError("Test validation exception"),
                    new EntityValidationError("Test validation exception", nameof(TestEntity.SampleProperty)),
                };
                var validationResult = new EntityValidationResult(new TestEntity(), errors);
                throw new EntityValidationException([validationResult]);
            });
            app.MapGet(Endpoints.BusinessException, () =>
            {
                throw new TestBusinessException("Test exception occured.");
            });
            app.MapGet(Endpoints.SecurityException, () =>
            {
                throw new SecurityException();
            });
            app.MapGet(Endpoints.UnhandledException, () =>
            {
                throw new InvalidOperationException();
            });
        }

        [Test]
        public static void ProblemDetails_Serialized_IsSameDeserialized()
        {
            // Arrange
            var oiginal = new ProblemDetails
            {
                Title = "Test title",
                Detail = "Test detail",
                Status = 500,
                Instance = "/test/instance",
            };
            var correlationId = new Guid("455929db-aab1-48bc-840a-4460a2f3855e");
            oiginal.SetCorrelationId(correlationId);
            var originalMessage = "Test original message";
            oiginal.SetOriginalMessage(originalMessage);
            var stackTrace = "Test stack trace";
            oiginal.SetStackTrace(stackTrace);

            // Act
            var serialized = JsonSerializer.Serialize(oiginal);
            var deserialized = JsonSerializer.Deserialize<ProblemDetails>(serialized);

            // Assert
            Assert.That(deserialized, Is.Not.Null);
            Assert.Multiple(() =>
            {
                Assert.That(deserialized.Title, Is.EqualTo(oiginal.Title));
                Assert.That(deserialized.Detail, Is.EqualTo(oiginal.Detail));
                Assert.That(deserialized.Status, Is.EqualTo(oiginal.Status));
                Assert.That(deserialized.Instance, Is.EqualTo(oiginal.Instance));
                Assert.That(deserialized.GetCorrelationId(), Is.EqualTo(correlationId));
                Assert.That(deserialized.GetOriginalMessage(), Is.EqualTo(originalMessage));
                Assert.That(deserialized.GetStackTrace(), Is.EqualTo(stackTrace));
            });
        }
    }
}
