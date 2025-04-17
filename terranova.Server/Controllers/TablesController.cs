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

            return app;
        }

        [AllowAnonymous]
        private static async Task<IResult> showGlasses(
            [AsParameters] DataForTables data,
            CocktailsDbContext dbContext)
        {
            int pageSize = data.PageSize.HasValue && data.PageSize.Value > 0 ? Math.Min(data.PageSize.Value, 50) : 20;
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
            int pageSize = data.PageSize.HasValue && data.PageSize.Value > 0 ? Math.Min(data.PageSize.Value, 50) : 20;
            int page = data.Page.HasValue && data.Page.Value > 0 ? data.Page.Value : 1;
            int skip = (page - 1) * pageSize;

            var query = await dbContext.Ingredients
                .OrderBy(x => x.Name)
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();

            var result = query.Select(x => new
            {
                x.Id,
                x.Name
            }).ToList();

            return Results.Ok(result);
        }
    }
    public class DataForTables
    {
        public int? PageSize { get; set; }
        public int? Page { get; set; }
    }
}
