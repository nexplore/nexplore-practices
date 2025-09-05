namespace Nexplore.Practices.Tests.Unit.Web.Exception
{
    using System;
    using System.IO;
    using System.Net;
    using System.Net.Http;
    using System.Net.Http.Json;
    using System.Runtime.CompilerServices;
    using System.Text.Json.Nodes;
    using System.Text.RegularExpressions;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.TestHost;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Localization;
    using Microsoft.Extensions.Options;
    using Nexplore.Practices.Core.Domain.Model;
    using Nexplore.Practices.Core.Exceptions;
    using Nexplore.Practices.Core.Services;
    using Nexplore.Practices.Web.Configuration;
    using Nexplore.Practices.Web.Dtos.Errors;
    using NSubstitute;
    using NUnit.Framework;

    [TestFixture]
    public abstract class ExceptionTestsBase
    {
        private TestServer server;

        protected HttpClient Client { get; private set; }

        protected ApiOptions ApiOptions { get; } = new ApiOptions();

        [SetUp]
        public virtual void SetUp()
        {
            var builder = WebApplication.CreateBuilder();
            builder.WebHost.UseTestServer();

            this.AddSubstitutes(builder.Services);
            this.AddServices(builder.Services);

            var app = builder.Build();
            this.Configure(app);

            this.server = app.GetTestServer();
            app.Start();
            this.Client = this.server.CreateClient();
        }

        [TearDown]
        public virtual void TearDown()
        {
            this.Client?.Dispose();
            this.Client = null;
            this.server?.Dispose();
            this.server = null;
        }

        [Test]
        public async Task GetEntityNotFoundException_ThrowsNotFound()
        {
            // Act
            var response = await this.Client.GetAsync(Endpoints.EntityNotFoundException);

            // Assert
            await this.AddOrAssertSnapshotAsync(response, HttpStatusCode.NotFound);
        }

        [Test]
        public async Task GetEntityValidationException_ThrowsBadRequest()
        {
            // Act
            var response = await this.Client.GetAsync(Endpoints.EntityValidationException);

            // Assert
            await this.AddOrAssertSnapshotAsync(response, HttpStatusCode.BadRequest);
        }

        [Test]
        public async Task GetEntityValidationException_With422_ThrowsBadRequest()
        {
            // Arrange
            this.ApiOptions.ValidationErrorStatusCode = (int)HttpStatusCode.UnprocessableEntity;

            // Act
            var response = await this.Client.GetAsync(Endpoints.EntityValidationException);

            // Assert
            await this.AddOrAssertSnapshotAsync(response, HttpStatusCode.UnprocessableEntity);
        }

        [Test]
        public async Task GetBusinessException_ThrowsBadRequest()
        {
            // Act
            var response = await this.Client.GetAsync(Endpoints.BusinessException);

            // Assert
            await this.AddOrAssertSnapshotAsync(response, HttpStatusCode.BadRequest);
        }

        [Test]
        public async Task GetSecurityException_ThrowsForbidden()
        {
            // Act
            var response = await this.Client.GetAsync(Endpoints.SecurityException);

            // Assert
            await this.AddOrAssertSnapshotAsync(response, HttpStatusCode.Forbidden);
        }

        [Test]
        public async Task GetUnhandledException_WithoutDetails_ThrowsInternalServerError()
        {
            // Arrange
            this.ApiOptions.IncludeFullExceptionDetails = false;

            // Act
            var response = await this.Client.GetAsync(Endpoints.UnhandledException);

            // Assert
            await this.AddOrAssertSnapshotAsync(response, HttpStatusCode.InternalServerError);
        }

        [Test]
        public async Task GetUnhandledException_WithDetails_ThrowsInternalServerError()
        {
            // Arrange
            this.ApiOptions.IncludeFullExceptionDetails = true;

            // Act
            var response = await this.Client.GetAsync(Endpoints.UnhandledException);

            // Assert
            await this.AddOrAssertSnapshotAsync(response, HttpStatusCode.InternalServerError);
        }

        protected virtual void AddSubstitutes(IServiceCollection services)
        {
            var apiOptions = Substitute.For<IOptions<ApiOptions>>();
            apiOptions.Value.Returns(this.ApiOptions);
            services.AddSingleton(apiOptions);

            var httpRequestService = Substitute.For<IHttpRequestService>();
            httpRequestService.GetRequestId().Returns(new Guid("2b802405-cdb0-42b2-9005-0823bc5cf320"));
            services.AddSingleton(httpRequestService);

            var stringLocalizer = Substitute.For<IStringLocalizer>();
            stringLocalizer["setup"]
                .ReturnsForAnyArgs(x => new LocalizedString(x.ArgAt<string>(0), "Localized " + x.ArgAt<string>(0)));
            stringLocalizer["setup", Arg.Any<object[]>()]
                .ReturnsForAnyArgs(x => new LocalizedString(x.ArgAt<string>(0), "Localized " + x.ArgAt<string>(0)));
            var stringLocalizerFactory = Substitute.For<IStringLocalizerFactory>();
            stringLocalizerFactory
                .Create(Arg.Any<string>(), Arg.Any<string>())
                .Returns(stringLocalizer);
            stringLocalizerFactory
                .Create(Arg.Any<Type>())
                .Returns(stringLocalizer);
            services.AddSingleton(stringLocalizerFactory);
        }

        protected virtual void AddServices(IServiceCollection services)
        {
        }

        protected virtual void Configure(WebApplication app)
        {
        }

        protected virtual async Task AddOrAssertSnapshotAsync(HttpResponseMessage response, HttpStatusCode statusCode, [CallerMemberName] string testName = null)
        {
            Assert.That(response.StatusCode, Is.EqualTo(statusCode));

            var jsonObject = await response.Content.ReadFromJsonAsync<JsonObject>();
            this.AdjustSnapshotValues(jsonObject);
            var snapshotValue = jsonObject.ToString();

            var snapshotFolderPath = this.GetSnapshotFolderPath();
            if (!Directory.Exists(snapshotFolderPath))
            {
                Directory.CreateDirectory(snapshotFolderPath);
            }

            var snapshotFilePath = $"{snapshotFolderPath}/{testName}.json";
            if (!File.Exists(snapshotFilePath))
            {
                await File.WriteAllTextAsync(snapshotFilePath, snapshotValue);
            }
            else
            {
                var actualSnapshotValue = await File.ReadAllTextAsync(snapshotFilePath);
                Assert.That(snapshotValue, Is.EqualTo(actualSnapshotValue), $"Snapshot '{snapshotFilePath}' changed.");
            }
        }

        protected virtual void AdjustSnapshotValues(JsonObject jsonObject)
        {
            if (jsonObject.ContainsKey("errorDetailStackTrace"))
            {
                var stackTrace = jsonObject["errorDetailStackTrace"]?.GetValue<string>();
                jsonObject["errorDetailStackTrace"] = stackTrace?[..Math.Max(0, stackTrace.IndexOf(" in ", StringComparison.InvariantCulture))];
            }

            if (jsonObject.ContainsKey(ProblemDetailsExtensions.Keys.StackTrace))
            {
                var stackTrace = jsonObject[ProblemDetailsExtensions.Keys.StackTrace].GetValue<string>();
                var length = stackTrace.IndexOf(" in ", StringComparison.InvariantCulture) switch
                {
                    int index when index > 0 => index,
                    _ => stackTrace.Length,
                };
                jsonObject[ProblemDetailsExtensions.Keys.StackTrace] = stackTrace?[..length];
            }

            if (jsonObject.ContainsKey(ProblemDetailsExtensions.Keys.TraceId))
            {
                var traceId = jsonObject[ProblemDetailsExtensions.Keys.TraceId].GetValue<string>();
                if (Regex.IsMatch(traceId, @"^00-([a-z0-9]{32})-([a-z0-9]{16})-00$"))
                {
                    var adjustedTraceId = "00-00000000000000000000000000000000-0000000000000000-00";
                    jsonObject[ProblemDetailsExtensions.Keys.TraceId] = adjustedTraceId;
                }
            }
        }

        private string GetSnapshotFolderPath()
        {
            var testFixture = this.GetType();
            var assemblyLocation = new FileInfo(new Uri(testFixture.Assembly.Location).LocalPath);
            var expectedProjectDirectory = assemblyLocation.Directory.Parent.Parent.Parent;
            if (!Directory.Exists(expectedProjectDirectory.FullName))
            {
                throw new DirectoryNotFoundException($"Snapshots folder '{expectedProjectDirectory.FullName}' not found.");
            }

            return Path.Combine(expectedProjectDirectory.FullName, "Snapshots", "Web", "Exception", testFixture.Name);
        }

        internal static class Endpoints
        {
            public const string WithoutException = "without-exception";
            public const string EntityNotFoundException = "entity-not-found-exception";
            public const string EntityValidationException = "entity-validation-exception";
            public const string BusinessException = "business-exception";
            public const string SecurityException = "security-exception";
            public const string UnhandledException = "unhandled-exception";
        }

        internal sealed class TestEntity : IValidatable
        {
            public string SampleProperty { get; set; }
        }

        internal sealed class TestBusinessException : BusinessException
        {
            public TestBusinessException(string localizedMessage)
                : base(localizedMessage)
            {
            }
        }
    }
}
