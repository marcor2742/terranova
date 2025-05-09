using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using terranova.Server.Models;

namespace terranova.Server.Extensions
{
    public static class IdentityExtensions
    {
        public static IServiceCollection AddIdentityHandlerAndStores(this IServiceCollection services)
        {
            services.AddIdentityApiEndpoints<IdentityUserExtended>(options =>
                    {
                        //options.IdentityApiEndpointRoutes.DisableAccountEndpoint("register"); //overwrite /register (doesn't work)

                        //options.User.RequireUniqueEmail = true; // moved
                    })
                    .AddRoles<IdentityRole>()
                    .AddEntityFrameworkStores<IdentityUserContext>()
                    .AddDefaultTokenProviders();

            //services.Configure<DataProtectionTokenProviderOptions>(options =>
            //{
            //    options.TokenLifespan = TimeSpan.FromDays(7); //refresh token lifespan
            //});

            return services;
        }

        public static IServiceCollection ConfigureIdentityOptions(this IServiceCollection services)
        {
            services.Configure<IdentityOptions>(options =>
            {
                options.User.RequireUniqueEmail = true; //for some reason email is not unique by default
                options.Password.RequireDigit = false; //docs.md line 14 for documentation
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireNonAlphanumeric = false;
                //options.RequiewsUniqueChars = 2; //default is 1 (disabled), with 2 it requires 2 different characters
            });
            return services;
        }

        //Auth = Authentication + Authorization
        public static IServiceCollection AddIdentityAuth(
            this IServiceCollection services,
            IConfiguration config)
        {
            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme =
                x.DefaultChallengeScheme =
                x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(y =>
            {
                y.SaveToken = false;
                y.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(config["AppSettings:JWT_Secret"]!)),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                //y.Events = new JwtBearerEvents
                //{
                //    OnChallenge = async context =>
                //    {
                //        // Aggiungi intestazioni per evitare problemi CORS
                //        context.Response.Headers.Append("Access-Control-Allow-Credentials", "true");
                //        context.Response.Headers.Append("Access-Control-Allow-Origin", context.Request.Headers["Origin"]);

                //        // Log per il debug
                //        Console.WriteLine($"OnChallenge: Autenticazione richiesta per {context.Request.Path}");
                //        Console.WriteLine($"Origin: {context.Request.Headers["Origin"]}");

                //        // Non interrompere la pipeline di autenticazione
                //        await Task.CompletedTask;
                //    },
                //    OnAuthenticationFailed = context =>
                //    {
                //        Console.WriteLine($"Autenticazione fallita: {context.Exception.Message}");
                //        return Task.CompletedTask;
                //    },
                //    OnTokenValidated = context =>
                //    {
                //        Console.WriteLine($"Token valido per l'utente: {context.Principal?.Identity?.Name}");
                //        return Task.CompletedTask;
                //    },
                //    OnMessageReceived = context =>
                //    {
                //        Console.WriteLine($"Token ricevuto per la richiesta: {context.Request.Path}");
                //        var token = context.Request.Headers["Authorization"].ToString();
                //        if (!string.IsNullOrEmpty(token) && token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                //        {
                //            Console.WriteLine($"Token presente nell'header: {token.Substring(0, Math.Min(20, token.Length))}...");
                //        }
                //        else
                //        {
                //            Console.WriteLine("Nessun token nell'header Authorization");
                //        }

                //        return Task.CompletedTask;
                //    }
                //};
            });
            //enable fallback policy to require authentication for all endpoints with jwt
            services.AddAuthorization(options =>
            {
                //options.FallbackPolicy = new AuthorizationPolicyBuilder()
                //    .AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme)
                //    .RequireAuthenticatedUser()
                //    .Build();

                options.AddPolicy("CanPurchaseAlcohol", policy =>
                {
                    policy.RequireClaim("Over18", "true");
                });
                options.AddPolicy("Over21", policy =>
                    policy.RequireAssertion(context =>
                    Int32.Parse(context.User.Claims.First(x => x.Type == "Age").Value) >= 21));
            });
            return services;
        }

        public static WebApplication AddIdentityAuthMiddlewares(this WebApplication app)
        {
            app.UseAuthentication();
            app.UseAuthorization();
            return app;
        }
    }
}
