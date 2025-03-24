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
                    .AddEntityFrameworkStores<IdentityUserContext>();

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
                };
            });
            //enable fallback policy to require authentication for all endpoints with jwt
            services.AddAuthorization(options =>
            {
                options.FallbackPolicy = new AuthorizationPolicyBuilder()
                    .AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme)
                    .RequireAuthenticatedUser()
                    .Build();
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
