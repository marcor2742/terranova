﻿using terranova.Server.Models;

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
                options.WithOrigins("http://localhost:56057",
                    "http://localhost:56057",
                    "http://127.0.0.1:56057",
                    "https://localhost:56057",
                    "https://127.0.0.1:56057",
                    "http://localhost:7073",
                    "https://localhost:7073",
                    "http://127.0.0.1:7073",
                    "http://localhost:8080",
                    "http://127.0.0.1:8080",
                    "https://localhost:8080",
                    "https://127.0.0.1:8080",
                    "http://localhost:8081",
                    "http://127.0.0.1:8081",
                    "https://localhost:8081",
                    "https://127.0.0.1:8081",
                    "http://localhost:10000",
                    "http://127.0.0.1:10000",
                    "http://azurite:10000"
                );


                // options.AllowAnyOrigin();
                options.AllowAnyHeader();
                options.WithExposedHeaders("Authorization", "X-Auth-Token");
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
