using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;

namespace terranova.Server.Controllers
{
    public static class AuthorizationEndpoints
    {
        public static IEndpointRouteBuilder MapAuthorizationEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("/AdminOnly", AdminOnly);

            app.MapGet("/AdminOrPremium", [Authorize(Roles = "Admin,Premium")] () => { return "AdminOrPremium"; });

            //policy defined in IdentityExtensions.cs
            app.MapGet("/Purchase", [Authorize(Policy = "CanPurchaseAlcohol")] () => { return "purchase can be done"; });

            //[Authorize(Policy = "Over21")] test

            return app;
        }

        [Authorize(Roles = "Admin")]
        private static string AdminOnly()
        {
            return "Admin Only";
        }
    }
}
