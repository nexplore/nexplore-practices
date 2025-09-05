namespace Nexplore.Practices.Tests.Unit.Web.Exception
{
    using Microsoft.AspNetCore.Builder;
    using Microsoft.Extensions.DependencyInjection;
    using Nexplore.Practices.Web.Filters;
    using NUnit.Framework;
    using NUnit.Framework.Internal;

    [TestFixture]
    public class ExceptionFilterTests : ExceptionTestsBase
    {
        protected override void AddServices(IServiceCollection services)
        {
            base.AddServices(services);

            services
                .AddControllersWithViews(options =>
                {
                    options.Filters.Add<UnhandledExceptionFilterAttribute>();
                    options.Filters.Add<SecurityExceptionFilterAttribute>();
                    options.Filters.Add<BusinessExceptionFilterAttribute>();
                    options.Filters.Add<EntityValidationExceptionFilterAttribute>();
                    options.Filters.Add<EntityNotFoundExceptionFilterAttribute>();
                })
                .AddApplicationPart(typeof(ExceptionTestController).Assembly)
                .AddControllersAsServices();
        }

        protected override void Configure(WebApplication app)
        {
            base.Configure(app);

            app.UseExceptionHandler(new ExceptionHandlerOptions()
            {
                ExceptionHandlingPath = "/error",
            });
            app.MapControllers();
        }
    }
}
