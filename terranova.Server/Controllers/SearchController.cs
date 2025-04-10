using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using terranova.Server.Models;

namespace terranova.Server.Controllers
{
    public static class SearchController
    {
        public static IEndpointRouteBuilder MapSearchEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("/search", SearchCocktails)
               .WithDescription("Cerca cocktail per nome, ordinando prima quelli che iniziano con la parola cercata")
               .WithOpenApi();
            return app;
        }

        [AllowAnonymous]
        private static async Task<IResult> SearchCocktails(
            [AsParameters] DataForQuery data,
            CocktailsDbContext dbContext)
        {
            var name = data.SearchString?.ToLower();
            if (string.IsNullOrWhiteSpace(name))
            {
                return Results.BadRequest("Search string cannot be empty.");
            }
            int pageSize = data.PageSize.HasValue && data.PageSize.Value > 0 ? Math.Min(data.PageSize.Value, 50) : 20;
            int page = data.Page.HasValue && data.Page.Value > 0 ? data.Page.Value : 1;
            int skip = (page - 1) * pageSize;

            var query = await dbContext.Cocktails
                .Where(c => c.Name.ToLower().Contains(name))
                .OrderByDescending(c => c.Name.ToLower().StartsWith(name))
                .ThenBy(c => c.Name)
                .Skip(skip)
                .Take(pageSize)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Category,
                    c.Glass,
                    c.ImageUrl,
                    c.IsAlcoholic
                })
                .ToListAsync();

            return Results.Ok(query);

            //se non trova cose che iniziano con "name" allora cerca con contains. penso, guardare se è meglio usare sempre contains
            //var query = dbContext.Cocktails
            //    .Where(c => c.Name.ToLower().Contains(name))
            //    .ToListAsync();

        }
    }

    public class DataForQuery
    {
        /// <summary>
        /// nome o lettere
        /// </summary>
        public string? SearchString { get; set; }
        public int? PageSize { get; set; }
        public int? Page { get; set; }
        //public string? Category { get; set; }
        //public string? Glass { get; set; }
        //public string? BaseIngredient { get; set; }
        //public string? AlcoholContent { get; set; }
    }
}
