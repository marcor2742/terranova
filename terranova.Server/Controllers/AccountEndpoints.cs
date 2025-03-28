using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using terranova.Server.Models;

namespace terranova.Server.Controllers
{
    public static class AccountEndpoints
    {
        public static IEndpointRouteBuilder MapAccountEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("/UserProfile", GetUserProfile); //.RequireAuthorization();

            return app;
        }

        //[Authorize] //default policy
        private static async Task<IResult> GetUserProfile(ClaimsPrincipal user,
            UserManager<IdentityUserExtended> userManager)
        {
            string userID = user.Claims.First(x => x.Type == "UserID").Value;
            var userDetails = await userManager.FindByIdAsync(userID);
            return Results.Ok(new
            {
                FullName = userDetails?.FullName,
                Email = userDetails?.Email,
                UserName = userDetails?.UserName
            });
        }
    }
}
