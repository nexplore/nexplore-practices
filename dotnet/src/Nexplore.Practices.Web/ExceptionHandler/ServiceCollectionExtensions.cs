namespace Nexplore.Practices.Web.ExceptionHandler
{
    using Microsoft.Extensions.DependencyInjection;

    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddNexploreExceptionHandlers(this IServiceCollection services)
        {
            services
                .AddExceptionHandler<EntityNotFoundExceptionHandler>()
                .AddExceptionHandler<EntityValidationExceptionHandler>()
                .AddExceptionHandler<BusinessExceptionHandler>()
                .AddExceptionHandler<SecurityExceptionHandler>()
                .AddExceptionHandler<UnhandledExceptionHandler>();

            return services;
        }
    }
}
