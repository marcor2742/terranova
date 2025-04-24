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
                options.WithOrigins("http://localhost:56057");
                options.WithOrigins("http://127.0.0.1:56057");
                options.WithOrigins("http://127.0.0.1:56057");
                options.WithOrigins("https://localhost:56057");
                options.WithOrigins("https://localhost:56057");
                options.WithOrigins("https://127.0.0.1:56057");
                options.WithOrigins("https://127.0.0.1:56057");
                // options.AllowAnyOrigin();
                options.AllowAnyHeader();
                options.AllowAnyMethod();
                options.AllowCredentials();
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
