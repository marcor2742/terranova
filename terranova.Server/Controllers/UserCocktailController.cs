using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using terranova.Server.Services;

namespace terranova.Server.Controllers
{
    public static class UserCocktailController
    {
        public static IEndpointRouteBuilder MapUserCocktailEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapPost("/favorites/{id}", AddToFavorites)
               .RequireAuthorization();

            app.MapDelete("/favorites/{id}", RemoveFromFavorites)
               .RequireAuthorization();

            app.MapGet("/favorites", GetUserFavorites)
               .RequireAuthorization();

            app.MapGet("/search-history", GetUserSearchHistory)
               .RequireAuthorization();

            return app;
        }

        private static async Task<IResult> AddToFavorites(
            long id,
            ClaimsPrincipal user,
            UserCocktailService service)
        {
            var userId = user.FindFirst("UserID")?.Value;
            if (userId == null)
                return Results.BadRequest(new { message = "User not found" });

            var result = await service.AddToFavoritesAsync(userId, id);
            if (!result)
                return Results.NotFound(new { message = "Cocktail not found" });

            return Results.Ok(new { message = "Added to favorites" });
        }

        private static async Task<IResult> RemoveFromFavorites(
            long id,
            ClaimsPrincipal user,
            UserCocktailService service)
        {
            var userId = user.FindFirst("UserID")?.Value;
            if (userId == null)
                return Results.BadRequest(new { message = "User not found" });

            var result = await service.RemoveFromFavoritesAsync(userId, id);
            if (!result)
                return Results.NotFound(new { message = "Favorite not found" });

            return Results.Ok(new { message = "Removed from favorites" });
        }

        private static async Task<IResult> GetUserFavorites(
            ClaimsPrincipal user,
            UserCocktailService service,
            int page = 1,
            int pageSize = 20)
        {
            var userId = user.FindFirst("UserID")?.Value;
            if (userId == null)
                return Results.BadRequest(new { message = "User not found" });

            var favorites = await service.GetUserFavoritesAsync(userId, page, Math.Min(pageSize, 50));
            return Results.Ok(favorites);
        }

        private static async Task<IResult> GetUserSearchHistory(
            ClaimsPrincipal user,
            UserCocktailService service,
            int page = 1,
            int pageSize = 20)
        {
            var userId = user.FindFirst("UserID")?.Value;
            if (userId == null)
                return Results.BadRequest(new { message = "User not found" });

            var history = await service.GetSearchHistoryAsync(userId, page, Math.Min(pageSize, 50));
            return Results.Ok(history);
        }
    }
}
