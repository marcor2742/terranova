using Microsoft.EntityFrameworkCore;
using terranova.Server.Models;

namespace terranova.Server.Services
{
    public class UserCocktailService
    {
        private readonly IdentityUserContext _userContext;
        private readonly CocktailsDbContext _cocktailContext;

        public UserCocktailService(
            IdentityUserContext userContext,
            CocktailsDbContext cocktailContext)
        {
            _userContext = userContext;
            _cocktailContext = cocktailContext;
        }

        public async Task<bool> AddToFavoritesAsync(string userId, long cocktailId)
        {
            if (!await _cocktailContext.Cocktails.AnyAsync(c => c.Id == cocktailId))
                return false;

            // Check if the cocktail is already in favorites
            if (await _userContext.Favorites.AnyAsync(f => f.UserId == userId && f.CocktailId == cocktailId))
                return true;

            var favorite = new Favorite
            {
                UserId = userId,
                CocktailId = cocktailId
            };

            _userContext.Favorites.Add(favorite);
            await _userContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveFromFavoritesAsync(string userId, long cocktailId)
        {
            var favorite = await _userContext.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.CocktailId == cocktailId);

            if (favorite == null)
                return false;

            _userContext.Favorites.Remove(favorite);
            await _userContext.SaveChangesAsync();
            return true;
        }

        public async Task AddToSearchHistoryAsync(string userId, long cocktailId)
        {
            var searchHistory = await _userContext.SearchHistories
                .FirstOrDefaultAsync(sh => sh.UserId == userId && sh.CocktailId == cocktailId);

            if (searchHistory != null)
            {
                searchHistory.Count++;
                searchHistory.Date = DateTimeOffset.UtcNow;
            }
            else
            {
                searchHistory = new SearchHistory
                {
                    UserId = userId,
                    CocktailId = cocktailId
                };
                _userContext.SearchHistories.Add(searchHistory);
            }

            await _userContext.SaveChangesAsync();
        }

        public async Task<List<dynamic>> GetUserFavoritesAsync(string userId, int page = 1, int pageSize = 20)
        {
            var skip = (page - 1) * pageSize;

            // takes favorites ids from user context with userId
            var favoriteIds = await _userContext.Favorites
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.Date)
                .Skip(skip)
                .Take(pageSize)
                .Select(f => f.CocktailId)
                .ToListAsync();

            if (!favoriteIds.Any())
                return new List<dynamic>();

            // takes cocktails info with the id in favoritesIds
            var cocktails = await _cocktailContext.Cocktails
                .Where(c => favoriteIds.Contains(c.Id))
                .Include(c => c.Glass)
                .Include(c => c.Instructions)
                .Include(c => c.CocktailIngredients)
                    .ThenInclude(ci => ci.Ingredient)
                .Include(c => c.CocktailIngredients)
                    .ThenInclude(ci => ci.Measure)
                .ToListAsync();

            return cocktails
                .OrderBy(c => favoriteIds.IndexOf(c.Id))
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Category,
                    c.IsAlcoholic,
                    Glass = c.Glass?.Name,
                    Instructions = new
                    {
                        En = c.Instructions?.En,
                        Es = c.Instructions?.Es,
                        De = c.Instructions?.De,
                        Fr = c.Instructions?.Fr,
                        It = c.Instructions?.It
                    },
                    c.ImageUrl,
                    Ingredients = c.CocktailIngredients.Select(ci => new
                    {
                        Ingredient = ci.Ingredient.Name,
                        MetricMeasure = ci.Measure?.Metric,
                        ImperialMeasure = ci.Measure?.Imperial
                    }).ToList()
                })
                .Cast<dynamic>()
                .ToList();
        }

        public async Task<List<dynamic>> GetSearchHistoryAsync(string userId, int page = 1, int pageSize = 20)
        {
            var skip = (page - 1) * pageSize;

            var historyItems = await _userContext.SearchHistories
                .Where(sh => sh.UserId == userId)
                .OrderByDescending(sh => sh.Date)
                .Skip(skip)
                .Take(pageSize)
                .Select(sh => new { sh.CocktailId, sh.Count })
                .ToListAsync();

            if (!historyItems.Any())
                return new List<dynamic>();

            var cocktailIds = historyItems.Select(h => h.CocktailId).ToList();

            var cocktails = await _cocktailContext.Cocktails
                .Where(c => cocktailIds.Contains(c.Id))
                .Include(c => c.Glass)
                .ToListAsync();

            return historyItems
                .Select(h =>
                {
                    var cocktail = cocktails.FirstOrDefault(c => c.Id == h.CocktailId);
                    return new
                    {
                        CocktailId = h.CocktailId,
                        SearchCount = h.Count,
                        Name = cocktail?.Name,
                        ImageUrl = cocktail?.ImageUrl,
                        Glass = cocktail?.Glass?.Name,
                        IsAlcoholic = cocktail?.IsAlcoholic
                    };
                })
                .Cast<dynamic>()
                .ToList();
        }

        public async Task<bool> CheckIfInFavoritesAsync(string userId, long cocktailId)
        {
            return await _userContext.Favorites
                .AnyAsync(f => f.UserId == userId && f.CocktailId == cocktailId);
        }
    }
}
