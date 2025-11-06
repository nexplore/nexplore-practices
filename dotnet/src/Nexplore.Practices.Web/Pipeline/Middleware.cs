namespace Nexplore.Practices.Web.Pipeline
{
    using System;
    using System.IO;
    using System.Text.Json;
    using System.Text.Json.Serialization;
    using Autofac;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Localization;
    using Nexplore.Practices.Core.Localization;
    using Nexplore.Practices.Core.Scopes;
    using Nexplore.Practices.Web.Dtos.Errors;

    public static class Middleware
    {
        private static readonly JsonSerializerOptions jsonSerializerOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };

        public static IApplicationBuilder UsePerRequestScope(this IApplicationBuilder app, IServiceProvider serviceProvider)
        {
            var unitOfWorkFactory = serviceProvider.GetService<IUnitOfWorkFactory<ILifetimeScope>>();
            if (unitOfWorkFactory != null)
            {
                app.UsePerRequestUnitOfWork(unitOfWorkFactory);
            }
            else
            {
                var childScopeFactory = serviceProvider.GetRequiredService<IChildScopeFactory<ILifetimeScope>>();
                app.UsePerRequestChildScope(childScopeFactory);
            }

            return app;
        }

        public static void UseAngular(this IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Fallback handler for frontend routes
            app.Run(async (context) =>
            {
                if (context.Request.Path.StartsWithSegments("/api", StringComparison.InvariantCultureIgnoreCase) || env.WebRootPath == null)
                {
                    context.Response.StatusCode = 404;
                }
                else
                {
                    context.Response.ContentType = "text/html";
                    await context.Response.SendFileAsync(Path.Combine(env.WebRootPath, "index.html")).ConfigureAwait(false);
                }
            });
        }

        public static void UseLocalizedStatusCodePages(this IApplicationBuilder app, IServiceProvider serviceProvider)
        {
            app.UseStatusCodePages(async context =>
            {
                var stringLocalizerFactory = serviceProvider.GetRequiredService<IStringLocalizerFactory>();
                var stringLocalizer = stringLocalizerFactory.Create(typeof(PracticesResourceNames));
                var serializeOptions = jsonSerializerOptions;

                var dto = new ErrorDto
                {
                    ErrorMessage = stringLocalizer[PracticesResourceNames.ERROR_STATUS_CODE + context.HttpContext.Response.StatusCode],
                };

                context.HttpContext.Response.ContentType = "application/json";
                await context.HttpContext.Response.WriteAsync(JsonSerializer.Serialize(dto, serializeOptions)).ConfigureAwait(false);
            });
        }

        private static void UsePerRequestChildScope(this IApplicationBuilder app, IChildScopeFactory<ILifetimeScope> childScopeFactory)
        {
            app.Use(async (context, next) =>
            {
                using (var childScope = childScopeFactory.Begin())
                {
                    context.RequestServices = childScope.Dependent.Resolve<IServiceProvider>();
                    await next().ConfigureAwait(false);
                }
            });
        }

        private static void UsePerRequestUnitOfWork(this IApplicationBuilder app, IUnitOfWorkFactory<ILifetimeScope> unitOfWorkFactory)
        {
            app.Use(async (context, next) =>
            {
                using (var unitOfWork = unitOfWorkFactory.Begin())
                {
                    context.RequestServices = unitOfWork.Dependent.Resolve<IServiceProvider>();
                    await next().ConfigureAwait(false);
                }
            });
        }
    }
}
