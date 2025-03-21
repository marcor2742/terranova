using terranova.Server.Models;

namespace terranova.Server.Extensions
{
    public static class AppConfigExtensions
    {
        public static WebApplication ConfigureCORS(
            this WebApplication app,
            IConfiguration config)
        {
            app.UseCors(options =>
            {
                options.WithOrigins("http://localhost:56057");
                // options.AllowAnyOrigin();
                options.AllowAnyHeader();
                options.AllowAnyMethod();
            });
            return app;
        }

        //builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));
        public static IServiceCollection AddAppConfig(
            this IServiceCollection services,
            IConfiguration config)
        {
            services.Configure<AppSettings>(config.GetSection("AppSettings"));
            return services;
        }
    }
}
