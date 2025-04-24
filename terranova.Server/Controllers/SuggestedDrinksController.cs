using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using terranova.Server.Models;
using terranova.Server.Services;

namespace terranova.Server.Controllers
{
    public static class SuggestedDrinksController
    {
        public static IEndpointRouteBuilder MapSuggestedEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("suggestedDrinks", SuggestedDrinks);

            return app;
        }

        private static async Task<IResult> SuggestedDrinks(
            ClaimsPrincipal user,
            CocktailsDbContext dbContext,
            IdentityUserContext userContext,
            UserManager<IdentityUserExtended> userManager)
        {
            var userId = user.FindFirstValue("UserID");
            if (string.IsNullOrEmpty(userId))
            {
                return Results.Unauthorized();
            }
            var userEntity = await userManager.FindByIdAsync(userId);
            if (userEntity == null)
            {
                return Results.NotFound();
            }

            var favoritesQuery = await userContext.Favorites
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.Date)
                .Select(f => f.CocktailId)
                .ToListAsync();

            var searchHistoryQuery = await userContext.SearchHistories
                .Where(s => s.UserId == userId)
                .OrderBy(s => s.Count)
                .Select(s => s.CocktailId)
                .ToListAsync();

            var isOver18 = user.FindFirstValue("Over18") == "true";
            var alcoholContent = user.FindFirstValue("AlcoholContentPreference");
            var bestGlass = user.FindFirstValue("GlassPreference");
            var bestIngredient = user.FindFirstValue("BaseIngredientPreference");

            var favoriteDrinks = await dbContext.Cocktails
                .Where(f => favoritesQuery.Contains(f.Id))
                .Include(f => f.Glass)
                .Include(f => f.CocktailIngredients)
                    .ThenInclude(ci => ci.Ingredient)
                .ToListAsync();

            var searchHistoryDrinks = await dbContext.Cocktails
                .Where(s => searchHistoryQuery.Contains(s.Id))
                .Include(s => s.Glass)
                .Include(s => s.CocktailIngredients)
                    .ThenInclude(ci => ci.Ingredient)
                .ToListAsync();

            var favorites = favoriteDrinks.Select(c => new
            {
                c.Id,
                c.Name,
                c.Category,
                c.IsAlcoholic,
                Glass = c.Glass?.Name,
                c.ImageUrl,
                Ingredients = c.CocktailIngredients.Select(ci => new
                {
                    Name = ci.Ingredient.Name,
                    MetricMeasure = ci.Measure?.Metric,
                    ImperialMeasure = ci.Measure?.Imperial
                }).ToList()
            }).ToList();

            var history = searchHistoryDrinks.Select(c => new
            {
                c.Id,
                c.Name,
                c.Category,
                c.IsAlcoholic,
                Glass = c.Glass?.Name,
                c.ImageUrl,
                Ingredients = c.CocktailIngredients.Select(ci => new
                {
                    Name = ci.Ingredient.Name,
                    MetricMeasure = ci.Measure?.Metric,
                    ImperialMeasure = ci.Measure?.Imperial
                }).ToList()
            }).ToList();

            return Results.Ok(new { favorites, history });
        }
    }
}
