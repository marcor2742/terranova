﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;

namespace terranova.Server.Controllers
{
    public static class AuthorizationEndpoints
    {
        public static IEndpointRouteBuilder MapAuthorizationEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("/AdminOnly", AdminOnly)
            .WithDescription("test roles")
               .WithOpenApi();

            //inline lambda expression example: app.MapGet("/AdminOrPremium", [Authorize(Roles = "Admin,Premium")] () => { return "AdminOrPremium"; });
            app.MapGet("/AdminOrPremium", AdminOrPremium)
            .WithDescription("test roles")
               .WithOpenApi();

            //policy defined in IdentityExtensions.cs
            app.MapGet("/Purchase", Purchase)
            .WithDescription("test roles")
               .WithOpenApi();

            //[Authorize(Policy = "Over21")] test

            return app;
        }

        [Authorize(Roles = "Admin")]
        private static string AdminOnly()
        {
            return "Admin Only";
        }

        [Authorize(Roles = "Admin,Premium")]
        private static string AdminOrPremium()
        {
            return "Admin or Premium";
        }

        //policy defined in IdentityExtensions.cs
        [Authorize(Policy = "CanPurchaseAlcohol")]
        private static string Purchase()
        {
            return "purchase can be done";
        }
    }
}
