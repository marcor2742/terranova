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

            app.MapGet("/search/{id}", SearchById)
               .WithDescription("Cerca cocktail per un id")
               .WithOpenApi();

            app.MapPost("/editCocktails/", CreateCocktail)
               .WithDescription("Crea o aggiorna un cocktail con un ID specifico")
               .WithOpenApi();

            app.MapPut("/editCocktails/{id}", UpdateCocktail)
               .WithDescription("Aggiorna un cocktail esistente con ID specifico")
               .WithOpenApi();

            app.MapDelete("/editCocktails/{id}", DeleteCocktail)
               .WithDescription("Elimina un cocktail con ID specifico")
               .WithOpenApi();

            //outputta tutti
            return app;
        }

        [AllowAnonymous]
        private static async Task<IResult> SearchById(
            int id,
            CocktailsDbContext dbContext)
        {
            var cocktail = await dbContext.Cocktails
                .Where(c => c.Id == id)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Category,
                    c.Glass,
                    c.ImageUrl,
                    c.IsAlcoholic
                })
                .FirstOrDefaultAsync();
            return cocktail != null ? Results.Ok(cocktail) : Results.NotFound();
        }

        private static async Task<IResult> CreateCocktail(
            CocktailRequest cocktailData,
            CocktailsDbContext dbContext)
        {
            // Verifica che il nome sia fornito
            if (string.IsNullOrWhiteSpace(cocktailData.Name))
            {
                return Results.BadRequest("Il nome del cocktail è obbligatorio");
            }

            // Trova o crea il bicchiere
            Glass glass = null;
            if (!string.IsNullOrWhiteSpace(cocktailData.GlassName))
            {
                glass = await dbContext.Glasses
                    .FirstOrDefaultAsync(g => g.Name.ToLower() == cocktailData.GlassName.ToLower());

                if (glass == null)
                {
                    glass = new Glass { Name = cocktailData.GlassName };
                    dbContext.Glasses.Add(glass);
                    await dbContext.SaveChangesAsync();
                }
            }

            // Crea le istruzioni
            var instructions = new Instructions
            {
                En = cocktailData.Instructions?.En,
                Es = cocktailData.Instructions?.Es,
                De = cocktailData.Instructions?.De,
                Fr = cocktailData.Instructions?.Fr,
                It = cocktailData.Instructions?.It
            };
            dbContext.Instructions.Add(instructions);
            await dbContext.SaveChangesAsync();

            // Crea un nuovo cocktail
            var cocktail = new Cocktail
            {
                // L'ID verrà generato automaticamente dal database
                Name = cocktailData.Name,
                Category = cocktailData.Category,
                Iba = cocktailData.Iba,
                IsAlcoholic = cocktailData.IsAlcoholic,
                ImageUrl = cocktailData.ImageUrl,
                ImageSource = cocktailData.ImageSource,
                ImageAttribution = cocktailData.ImageAttribution,
                Tags = cocktailData.Tags,
                DateModified = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                GlassKey = glass?.Id ?? 0,
                InstructionsKey = instructions.Id
            };

            dbContext.Cocktails.Add(cocktail);
            await dbContext.SaveChangesAsync();

            // Gestione degli ingredienti
            if (cocktailData.Ingredients != null && cocktailData.Ingredients.Any())
            {
                // Aggiungi gli ingredienti
                foreach (var ingredientDto in cocktailData.Ingredients)
                {
                    if (string.IsNullOrEmpty(ingredientDto.Name)) continue;

                    // Trova o crea l'ingrediente
                    var ingredient = await dbContext.Ingredients
                        .FirstOrDefaultAsync(i => i.Name.ToLower() == ingredientDto.Name.ToLower());

                    if (ingredient == null)
                    {
                        ingredient = new Ingredient { Name = ingredientDto.Name };
                        dbContext.Ingredients.Add(ingredient);
                        await dbContext.SaveChangesAsync();
                    }

                    // Crea la misura
                    var measure = new Measure
                    {
                        Imperial = ingredientDto.Imperial,
                        Metric = ingredientDto.Metric
                    };

                    dbContext.Measures.Add(measure);
                    await dbContext.SaveChangesAsync();

                    // Crea la relazione
                    var cocktailIngredient = new CocktailIngredient
                    {
                        CocktailKey = cocktail.Id,
                        IngredientsKey = ingredient.Id,
                        MeasureKey = measure.Id
                    };

                    dbContext.CocktailsIngredients.Add(cocktailIngredient);
                }

                await dbContext.SaveChangesAsync();
            }

            return Results.Created($"/search/{cocktail.Id}", cocktail);
        }

        private static async Task<IResult> UpdateCocktail(
            int id,
            CocktailRequest cocktailData,
            CocktailsDbContext dbContext)
        {
            // Verifica che il nome sia fornito
            //if (string.IsNullOrWhiteSpace(cocktailData.Name))
            //{
            //    return Results.BadRequest("Il nome del cocktail è obbligatorio");
            //}

            // Cerca il cocktail esistente
            var cocktail = await dbContext.Cocktails.FindAsync(id);
            if (cocktail == null)
            {
                return Results.NotFound();
            }

            // Trova o crea il bicchiere
            Glass glass = null;
            if (!string.IsNullOrWhiteSpace(cocktailData.GlassName))
            {
                glass = await dbContext.Glasses
                    .FirstOrDefaultAsync(g => g.Name.ToLower() == cocktailData.GlassName.ToLower());

                if (glass == null)
                {
                    glass = new Glass { Name = cocktailData.GlassName };
                    dbContext.Glasses.Add(glass);
                    await dbContext.SaveChangesAsync();
                }
            }

            // Aggiorna le istruzioni
            var instructions = await dbContext.Instructions.FindAsync(cocktail.InstructionsKey);
            if (instructions != null && cocktailData.Instructions != null)
            {
                instructions.En = cocktailData.Instructions.En ?? instructions.En;
                instructions.Es = cocktailData.Instructions.Es ?? instructions.Es;
                instructions.De = cocktailData.Instructions.De ?? instructions.De;
                instructions.Fr = cocktailData.Instructions.Fr ?? instructions.Fr;
                instructions.It = cocktailData.Instructions.It ?? instructions.It;
                await dbContext.SaveChangesAsync();
            }

            // Aggiorna cocktail esistente
            cocktail.Name = cocktailData.Name;
            cocktail.Category = cocktailData.Category;
            cocktail.Iba = cocktailData.Iba;
            cocktail.IsAlcoholic = cocktailData.IsAlcoholic;
            cocktail.ImageUrl = cocktailData.ImageUrl;
            cocktail.ImageSource = cocktailData.ImageSource;
            cocktail.ImageAttribution = cocktailData.ImageAttribution;
            cocktail.Tags = cocktailData.Tags;
            cocktail.DateModified = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            if (glass != null)
            {
                cocktail.GlassKey = glass.Id;
            }

            await dbContext.SaveChangesAsync();

            // Gestione degli ingredienti
            if (cocktailData.Ingredients != null && cocktailData.Ingredients.Any())
            {
                // Rimuovi le vecchie relazioni
                var existingIngredients = dbContext.CocktailsIngredients
                    .Where(ci => ci.CocktailKey == cocktail.Id);
                dbContext.CocktailsIngredients.RemoveRange(existingIngredients);
                await dbContext.SaveChangesAsync();

                // Aggiungi i nuovi ingredienti
                foreach (var ingredientDto in cocktailData.Ingredients)
                {
                    if (string.IsNullOrEmpty(ingredientDto.Name)) continue;

                    // Trova o crea l'ingrediente
                    var ingredient = await dbContext.Ingredients
                        .FirstOrDefaultAsync(i => i.Name.ToLower() == ingredientDto.Name.ToLower());

                    if (ingredient == null)
                    {
                        ingredient = new Ingredient { Name = ingredientDto.Name };
                        dbContext.Ingredients.Add(ingredient);
                        await dbContext.SaveChangesAsync();
                    }

                    // Crea la misura
                    var measure = new Measure
                    {
                        Imperial = ingredientDto.Imperial,
                        Metric = ingredientDto.Metric
                    };

                    dbContext.Measures.Add(measure);
                    await dbContext.SaveChangesAsync();

                    // Crea la relazione
                    var cocktailIngredient = new CocktailIngredient
                    {
                        CocktailKey = cocktail.Id,
                        IngredientsKey = ingredient.Id,
                        MeasureKey = measure.Id
                    };

                    dbContext.CocktailsIngredients.Add(cocktailIngredient);
                }

                await dbContext.SaveChangesAsync();
            }

            return Results.Ok(cocktail);
        }


        private static async Task<IResult> DeleteCocktail(
            int id,
            CocktailsDbContext dbContext)
        {
            var cocktail = await dbContext.Cocktails.FindAsync(id);

            if (cocktail == null)
            {
                return Results.NotFound();
            }

            // 1. Trova e rimuovi le relazioni con gli ingredienti e le misure
            var cocktailIngredients = await dbContext.CocktailsIngredients
                .Where(ci => ci.CocktailKey == id)
                .ToListAsync();

            foreach (var ci in cocktailIngredients)
            {
                // Rimuovi la misura associata
                var measure = await dbContext.Measures.FindAsync(ci.MeasureKey);
                if (measure != null)
                {
                    dbContext.Measures.Remove(measure);
                }

                // Rimuovi la relazione
                dbContext.CocktailsIngredients.Remove(ci);
            }

            // 2. Rimuovi le istruzioni associate
            var instructions = await dbContext.Instructions.FindAsync(cocktail.InstructionsKey);
            if (instructions != null)
            {
                dbContext.Instructions.Remove(instructions);
            }

            // 3. Rimuovi il cocktail stesso
            dbContext.Cocktails.Remove(cocktail);

            // Salva tutte le modifiche
            await dbContext.SaveChangesAsync();

            return Results.NoContent();
        }



        // Classe per i dati delle richieste
        public class CocktailRequest
        {
            // Informazioni di base del cocktail
            public string Name { get; set; }
            public string Category { get; set; }
            public string Iba { get; set; } // International Bartender Association classification
            public bool IsAlcoholic { get; set; }
            public string ImageUrl { get; set; }
            public string ImageSource { get; set; }
            public string ImageAttribution { get; set; }
            public string Tags { get; set; }

            // Bicchiere
            public string GlassName { get; set; }

            // Istruzioni in diverse lingue
            public InstructionsDto Instructions { get; set; }

            // Lista di ingredienti con le loro misure
            public List<IngredientWithMeasureDto> Ingredients { get; set; }

            public class InstructionsDto
            {
                public string En { get; set; } // English
                public string Es { get; set; } // Spanish
                public string De { get; set; } // German
                public string Fr { get; set; } // French
                public string It { get; set; } // Italian
            }

            public class IngredientWithMeasureDto
            {
                public string Name { get; set; }
                public string Imperial { get; set; } // Misura imperiale (es. "2 oz")
                public string Metric { get; set; }   // Misura metrica (es. "60 ml")
            }
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
