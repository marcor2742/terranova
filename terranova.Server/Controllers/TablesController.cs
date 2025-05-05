using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using terranova.Server.Models;

namespace terranova.Server.Controllers
{
    public static class TablesController
    {
        public static IEndpointRouteBuilder MapTablesEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("/glassesTable", showGlasses)
               .WithDescription("mostra tutta la tabella degli glasses. con paginazione")
               .WithOpenApi();

            app.MapGet("/ingredientsTable", showIngredients)
               .WithDescription("mostra tutta la tabella degli ingredients. con paginazione")
               .WithOpenApi();

            app.MapGet("/categoriesTable", showCategories)
               .WithDescription("mostra tutta la tabella degli ingredients. con paginazione")
               .WithOpenApi();

            return app;
        }

        [AllowAnonymous]
        private static async Task<IResult> showCategories(
            [AsParameters] DataForTables data,
            CocktailsDbContext dbContext)
        {
            int pageSize = data.PageSize.HasValue && data.PageSize.Value > 0 ? Math.Min(data.PageSize.Value, 1000) : 100;
            int page = data.Page.HasValue && data.Page.Value > 0 ? data.Page.Value : 1;
            int skip = (page - 1) * pageSize;

            var query = await dbContext.Categories
                .OrderBy(x => x.Name)
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();

            return Results.Ok(query);
        }

        [AllowAnonymous]
        private static async Task<IResult> showGlasses(
            [AsParameters] DataForTables data,
            CocktailsDbContext dbContext)
        {
            int pageSize = data.PageSize.HasValue && data.PageSize.Value > 0 ? Math.Min(data.PageSize.Value, 1000) : 100;
            int page = data.Page.HasValue && data.Page.Value > 0 ? data.Page.Value : 1;
            int skip = (page - 1) * pageSize;

            var query = await dbContext.Glasses
                .OrderBy(x => x.Name)
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();

            return Results.Ok(query);
        }

        [AllowAnonymous]
        private static async Task<IResult> showIngredients(
            [AsParameters] DataForTables data,
            CocktailsDbContext dbContext)
        {

            int pageSize = data.PageSize.HasValue && data.PageSize.Value > 0 ? Math.Min(data.PageSize.Value, 1000) : 100;
            int page = data.Page.HasValue && data.Page.Value > 0 ? data.Page.Value : 1;
            int skip = (page - 1) * pageSize;

            var query = dbContext.Ingredients.AsQueryable();

            if (!string.IsNullOrWhiteSpace(data.SearchString))
            {
                var name = data.SearchString?.ToLower();
                query = query.Where(c => c.Name.ToLower().Contains(name));
            }

            var ingredients = await query
                    .OrderBy(x => x.Name)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

            var result = ingredients.Select(x => new
            {
                x.Id,
                x.Name
            }).ToList();

            return Results.Ok(result);
        }
    }
    public class DataForTables
    {
        public string? SearchString { get; set; }
        public int? PageSize { get; set; }
        public int? Page { get; set; }
    }
}
