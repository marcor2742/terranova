using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using System.Linq;
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

            int maxCount = 1;
            var hasSearchHistory = await userContext.SearchHistories
                .Where(s => s.UserId == userId)
                .AnyAsync();

            if (hasSearchHistory)
            {
                maxCount = await userContext.SearchHistories
                    .Where(s => s.UserId == userId)
                    .MaxAsync(s => s.Count);

                if (maxCount == 0)
                    maxCount = 1;
            }

            var searchHistories = await userContext.SearchHistories
                .Where(s => s.UserId == userId)
                .OrderBy(s => s.Count)
                .Select(s => new { s.CocktailId, s.Count })
                .ToListAsync();

            var searchHistoryQuery = new List<long>();
            foreach (var item in searchHistories)
            {
                int repeatCount = (int)(item.Count / (double)maxCount * 10);
                for (int i = 0; i < repeatCount; i++)
                {
                    searchHistoryQuery.Add(item.CocktailId);
                }
            }

            var createdDrinksQuery = await dbContext.Cocktails
                .Where(c => c.Creator == userId)
                .Select(c => c.Id)
                .ToListAsync();


            var isOver18 = user.FindFirstValue("Over18") == "true";
            var PreferAlcoholic = user.FindFirstValue("AlcoholContentPreference");
            var bestGlassPref = user.FindFirstValue("GlassPreference");
            var bestIngredientPref = user.FindFirstValue("BaseIngredientPreference");

            AlcoholContentPreference? alcoholContentPref = null;
            if (!string.IsNullOrEmpty(PreferAlcoholic) && Enum.TryParse<AlcoholContentPreference>(PreferAlcoholic, out var parsedPref))
            {
                alcoholContentPref = parsedPref;
            }

            var favoriteDrinks = await dbContext.Cocktails
                .Where(f => favoritesQuery.Contains(f.Id))
                .Include(f => f.Glass)
                .Include(f => f.CocktailIngredients)
                    .ThenInclude(ci => ci.Ingredient)
                .Include(f => f.CocktailIngredients)
                    .ThenInclude(ci => ci.Measure)
                .ToListAsync();

            var searchHistoryDrinks = await dbContext.Cocktails
                .Where(s => searchHistoryQuery.Contains(s.Id))
                .Include(s => s.Glass)
                .Include(s => s.CocktailIngredients)
                    .ThenInclude(ci => ci.Ingredient)
                .Include(f => f.CocktailIngredients)
                    .ThenInclude(ci => ci.Measure)
                .ToListAsync();

            var createdDrinks = await dbContext.Cocktails
                .Where(s => createdDrinksQuery.Contains(s.Id))
                .Include(s => s.Glass)
                .Include(s => s.CocktailIngredients)
                    .ThenInclude(ci => ci.Ingredient)
                .Include(f => f.CocktailIngredients)
                    .ThenInclude(ci => ci.Measure)
                .ToListAsync();

            //to avoid suggesting drinks that are already in favorites or search history
            var seenCocktailIds = favoritesQuery.Concat(searchHistoryQuery).Concat(createdDrinksQuery).Distinct().ToHashSet();

            var userIngredientVector = new Dictionary<string, double>();
            var userGlassPreferences = new Dictionary<string, double>();
            var userCategoryPreferences = new Dictionary<string, double>();

            AnalyzeUserPreferences(
                favoriteDrinks,
                userIngredientVector,
                userGlassPreferences,
                userCategoryPreferences,
                ingredientWeight: 3.0,
                glassWeight: 0.5,
                categoryWeight: 1.0);

            AnalyzeUserPreferences(
                searchHistoryDrinks,
                userIngredientVector,
                userGlassPreferences,
                userCategoryPreferences,
                ingredientWeight: 1.0,
                glassWeight: 0.1,
                categoryWeight: 0.2);

            AnalyzeUserPreferences(
                createdDrinks,
                userIngredientVector,
                userGlassPreferences,
                userCategoryPreferences,
                ingredientWeight: 4.0,
                glassWeight: 0.6,
                categoryWeight: 1.2);

            if (!string.IsNullOrEmpty(bestIngredientPref))
            {
                if (userIngredientVector.ContainsKey(bestIngredientPref))
                    userIngredientVector[bestIngredientPref] += 3.0;
                else
                    userIngredientVector[bestIngredientPref] = 3.0;
            }

            if (!string.IsNullOrEmpty(bestGlassPref))
            {
                if (userGlassPreferences.ContainsKey(bestGlassPref))
                    userGlassPreferences[bestGlassPref] += 3.0;
                else
                    userGlassPreferences[bestGlassPref] = 3.0;
            }

            //DEBUG rimuovere anche dal return
            var ingredientPreferences = userIngredientVector
                .OrderByDescending(kv => kv.Value)
                .Select(kv => new { Ingredient = kv.Key, Weight = kv.Value })
                .ToList();
            var glassPreferences = userGlassPreferences
                .OrderByDescending(kv => kv.Value)
                .Select(kv => new { Glass = kv.Key, Weight = kv.Value })
                .ToList();
            var categoryPreferences = userCategoryPreferences
                .OrderByDescending(kv => kv.Value)
                .Select(kv => new { Category = kv.Key, Weight = kv.Value })
                .ToList();


            var potentialFavoritesQuery = dbContext.Cocktails.AsQueryable();

            if (!isOver18)
            {
                potentialFavoritesQuery = potentialFavoritesQuery.Where(c => !c.IsAlcoholic);
            }

            if (seenCocktailIds.Any())
            {
                potentialFavoritesQuery = potentialFavoritesQuery.Where(c => !seenCocktailIds.Contains(c.Id));
            }

            var potentialRecommendations = await potentialFavoritesQuery
                .Include(c => c.Glass)
                .Include(c => c.Category)
                .Include(c => c.Instructions)
                .Include(c => c.CocktailIngredients)
                    .ThenInclude(ci => ci.Ingredient)
                .Include(c => c.CocktailIngredients)
                    .ThenInclude(ci => ci.Measure)
                .ToListAsync();

            var recommendationsWithScore = new List<(Cocktail Cocktail, double Score)>();

            foreach (var candidate in potentialRecommendations)
            {
                double ingredientScore = 0;
                double glassScore = 0;
                double categoryScore = 0;
                double alcoholPreferenceScore = 0;

                if (userIngredientVector.Any())
                {
                    var possibleDrinksIngredients = candidate.CocktailIngredients
                        .Select(ci => ci.Ingredient?.Name)
                        .Where(name => !string.IsNullOrEmpty(name) && !IsCommonIngredient(name))
                        .ToList();

                    double dotProduct = 0;
                    foreach (var ingredientName in possibleDrinksIngredients)
                    {
                        if (userIngredientVector.ContainsKey(ingredientName))
                        {
                            dotProduct += userIngredientVector[ingredientName];
                        }
                    }

                    double userVectorMagnitude = Math.Sqrt(userIngredientVector.Values.Sum(v => v * v));
                    //double candidateVectorMagnitude = Math.Sqrt(possibleDrinksIngredients.Count);
                    
                    if (userVectorMagnitude > 0/* && candidateVectorMagnitude > 0*/)
                    {
                        ingredientScore = dotProduct / (userVectorMagnitude /** candidateVectorMagnitude*/);
                    }
                }

                if (userGlassPreferences.Any() && candidate.Glass != null)
                {
                    string glassName = candidate.Glass.Name;
                    if (userGlassPreferences.ContainsKey(glassName))
                    {
                        glassScore = userGlassPreferences[glassName];
                    }
                }

                if (userCategoryPreferences.Any() && candidate.Category != null)
                {
                    string categoryName = candidate.Category.Name;
                    if (userCategoryPreferences.ContainsKey(categoryName))
                    {
                        categoryScore = userCategoryPreferences[categoryName];
                    }
                }
                if (isOver18 && alcoholContentPref.HasValue)
                {
                    if ((alcoholContentPref == AlcoholContentPreference.Alcoholic && candidate.IsAlcoholic) ||
                    (alcoholContentPref == AlcoholContentPreference.NonAlcoholic && !candidate.IsAlcoholic))
                    {
                        alcoholPreferenceScore = 1.5;
                    }
                }

                double finalScore = ingredientScore + glassScore + categoryScore + alcoholPreferenceScore;
                recommendationsWithScore.Add((candidate, finalScore));
            }

            Random random = new Random();
            var topRecommendations = recommendationsWithScore
                .Select(item => {
                    // Aggiungi un piccolo fattore casuale (±5%) al punteggio
                    double randomFactor = 1.0 + (random.NextDouble() * 0.1 - 0.05);
                    return (item.Cocktail, Score: item.Score * randomFactor);
                })
                .OrderByDescending(item => item.Score)
                .Take(10)
                .Select(item => item.Cocktail)
                .ToList();

            #region "if not sufficent data"
            // Popular random cocktail if not enough drinks in recommendations
            var popularCocktails = new List<Cocktail>();
            if (topRecommendations.Count < 10 || (searchHistoryDrinks.Count < 2 && favoriteDrinks.Count < 2))
            {
                var remainingToFetch = 10 - topRecommendations.Count;
                var allSeenIds = seenCocktailIds.Concat(topRecommendations.Select(r => r.Id)).ToHashSet();

                popularCocktails = await dbContext.Cocktails
                    .Where(c => !allSeenIds.Contains(c.Id))
                    .Where(c => isOver18 || !c.IsAlcoholic)
                    .Include(c => c.Glass)
                    .Include(c => c.Instructions)
                    .Include(c => c.CocktailIngredients)
                        .ThenInclude(ci => ci.Ingredient)
                    .Include(c => c.CocktailIngredients)
                        .ThenInclude(ci => ci.Measure)
                    .OrderBy(c => Guid.NewGuid()) 
                    .Take(remainingToFetch)
                    .ToListAsync();
            }

            var randoms = popularCocktails.Select(c => new
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
            #endregion

            var favorites = topRecommendations.Select(c => new
            {
                c.Id,
                c.Name,
                c.Category,
                c.IsAlcoholic,
                Glass = c.Glass?.Name,
                c.ImageUrl,
                Instructions = new
                {
                    En = c.Instructions?.En,
                    Es = c.Instructions?.Es,
                    De = c.Instructions?.De,
                    Fr = c.Instructions?.Fr,
                    It = c.Instructions?.It
                },
                Ingredients = c.CocktailIngredients.Select(ci => new
                {
                    Name = ci.Ingredient.Name,
                    MetricMeasure = ci.Measure?.Metric,
                    ImperialMeasure = ci.Measure?.Imperial
                }).ToList()
            }).ToList();

            return Results.Ok(new { favorites, randoms,
                diagnostics = new
                {
                    ingredientPreferences,
                    glassPreferences,
                    categoryPreferences
                }
            });
        }

        private static void AnalyzeUserPreferences(
            IEnumerable<Cocktail> drinks,
            Dictionary<string, double> userIngredientVector,
            Dictionary<string, double> userGlassPreferences,
            Dictionary<string, double> userCategoryPreferences,
            double ingredientWeight = 2.0,
            double glassWeight = 0.5,
            double categoryWeight = 1.0)
        {
            if (drinks == null || !drinks.Any())
                return;

            foreach (var drink in drinks)
            {
                foreach (var ci in drink.CocktailIngredients)
                {
                    string ingredientName = ci.Ingredient?.Name ?? "";
                    if (IsCommonIngredient(ingredientName))
                        continue;
                    if (userIngredientVector.ContainsKey(ingredientName))
                        userIngredientVector[ingredientName] += ingredientWeight;
                    else
                        userIngredientVector[ingredientName] = ingredientWeight;
                }

                if (drink.Glass != null && !string.IsNullOrEmpty(drink.Glass.Name))
                {
                    if (userGlassPreferences.ContainsKey(drink.Glass.Name))
                        userGlassPreferences[drink.Glass.Name] += glassWeight;
                    else
                        userGlassPreferences[drink.Glass.Name] = glassWeight;
                }

                if (drink.Category != null && !string.IsNullOrEmpty(drink.Category.Name))
                {
                    if (userCategoryPreferences.ContainsKey(drink.Category.Name))
                        userCategoryPreferences[drink.Category.Name] += categoryWeight;
                    else
                        userCategoryPreferences[drink.Category.Name] = categoryWeight;
                }
            }
        }

        private static bool IsCommonIngredient(string ingredientName)
        {
            if (string.IsNullOrEmpty(ingredientName))
                return false;

            // Lista di ingredienti comuni da ignorare
            var commonIngredients = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Ice", "Water", "Sugar", "Salt", "Garnish", "Soda Water", "Club Soda", "Ginger ale", "Powdered sugar"
            };

            return commonIngredients.Contains(ingredientName);
        }
    }
}
