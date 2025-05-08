using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using terranova.Server.Models;
using terranova.Server.Services;

namespace terranova.Server.Controllers
{
    public static class SearchController
    {
        public static IEndpointRouteBuilder MapSearchEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapPost("/editCocktails/", CreateCocktail)
               .WithDescription("Crea o aggiorna un cocktail con un ID specifico")
               .WithOpenApi();

            app.MapPut("/editCocktails/{id:long?}", UpdateCocktail)
               .WithDescription("Aggiorna un cocktail esistente con ID specifico")
               .WithOpenApi();

            app.MapDelete("/editCocktails/{id:long?}", DeleteCocktail)
               .WithDescription("Elimina un cocktail con ID specifico")
               .WithOpenApi();

            app.MapGet("/allCocktails/", ShowAllCocktails)
               .WithDescription("Restituisce tutti i drink del database visibili dall'utente, con paginazione e filtro per l'ordinamento")
               .WithOpenApi();

            app.MapGet("/search", SearchCocktails)
               .WithDescription("Cerca cocktail per nome, ordinando prima quelli che iniziano con la parola cercata con filtri. se non sei loggato o se il parametro showOnlyOriginal é true allora non verranno mostrati i drink con un creator nel db. contenuto alcolico: Alcoholic, NonAlcoholic, NoPreference")
               .WithOpenApi();

            app.MapGet("/search/{id:long?}", SearchById)
               .WithDescription("Cerca cocktail per un id, e aggiunge la ricerca a searchHistory")
               .WithOpenApi();

            return app;
        }

        private static async Task<IResult> CreateCocktail(
            ClaimsPrincipal user,
            CocktailRequest cocktailData,
            CocktailsDbContext dbContext)
        {
            var userId = user.FindFirst("UserID")?.Value;
            if (userId == null)
            {
                return Results.BadRequest(new { message = "User not found" });
            }
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

            // Trova o crea la categoria
            Category category = null;
            if (!string.IsNullOrWhiteSpace(cocktailData.Category))
            {
                category = await dbContext.Categories
                    .FirstOrDefaultAsync(c => c.Name.ToLower() == cocktailData.Category.ToLower());

                if (category == null)
                {
                    category = new Category { Name = cocktailData.Category };
                    dbContext.Categories.Add(category);
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
                CategoryKey = category?.Id,
                Iba = cocktailData.Iba,
                IsAlcoholic = cocktailData.IsAlcoholic ?? true,
                ImageUrl = cocktailData.ImageUrl,
                ImageSource = cocktailData.ImageSource,
                ImageAttribution = cocktailData.ImageAttribution,
                Tags = cocktailData.Tags,
                DateModified = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                GlassKey = glass?.Id ?? 0,
                InstructionsKey = instructions.Id,
                Creator = userId
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
            long? id,
            ClaimsPrincipal user,
            CocktailRequest cocktailData,
            CocktailsDbContext dbContext)
        {
            if (!id.HasValue)
            {
                return Results.BadRequest(new { message = "ID del cocktail non valido o non specificato" });
            }

            var userId = user.FindFirst("UserID")?.Value;
            if (userId == null)
            {
                return Results.BadRequest(new { message = "User not found" });
            }

            // Cerca il cocktail esistente
            var cocktail = await dbContext.Cocktails.FindAsync(id.Value);
            if (cocktail == null)
            {
                return Results.NotFound();
            }

            var isAdmin = user.IsInRole("Admin");
            if (cocktail.Creator != userId && !isAdmin)
            {
                return Results.Forbid();
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

            // Trova o crea la categoria
            Category category = null;
            if (!string.IsNullOrWhiteSpace(cocktailData.Category))
            {
                category = await dbContext.Categories
                    .FirstOrDefaultAsync(c => c.Name.ToLower() == cocktailData.Category.ToLower());

                if (category == null)
                {
                    category = new Category { Name = cocktailData.Category };
                    dbContext.Categories.Add(category);
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
            if (cocktailData.Name != null)
            {
                cocktail.Name = cocktailData.Name;
            }
            if (category != null)
            {
                cocktail.CategoryKey = category.Id;
            }
            if (cocktailData.Iba != null)
            {
                cocktail.Iba = cocktailData.Iba;
            }
            if (cocktailData.IsAlcoholic.HasValue)
            {
                cocktail.IsAlcoholic = cocktailData.IsAlcoholic.Value;
            }
            if (cocktailData.ImageUrl != null)
            {
                cocktail.ImageUrl = cocktailData.ImageUrl;
            }
            if (cocktailData.ImageSource != null)
            {
                cocktail.ImageSource = cocktailData.ImageSource;
            }
            if (cocktailData.ImageAttribution != null)
            {
                cocktail.ImageAttribution = cocktailData.ImageAttribution;
            }
            if (cocktailData.Tags != null)
            {
                cocktail.Tags = cocktailData.Tags;
            }
            cocktail.DateModified = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            if (glass != null)
            {
                cocktail.GlassKey = glass.Id;
            }


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
                    .Where(ci => ci.CocktailKey == cocktail.Id)
                    .Include(ci => ci.Measure);

                dbContext.CocktailsIngredients.RemoveRange(existingIngredients);
                foreach (var ci in existingIngredients)
                {
                    if (ci.Measure != null)
                    {
                        dbContext.Measures.Remove(ci.Measure);
                    }
                }

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
            long? id,
            ClaimsPrincipal user,
            CocktailsDbContext dbContext)
        {
            if (!id.HasValue)
            {
                return Results.BadRequest(new { message = "ID del cocktail non valido o non specificato" });
            }

            var userId = user.FindFirst("UserID")?.Value;
            if (userId == null)
            {
                return Results.BadRequest(new { message = "User not found" });
            }

            var cocktail = await dbContext.Cocktails.FindAsync(id.Value);
            if (cocktail == null)
            {
                return Results.NotFound();
            }

            var isAdmin = user.IsInRole("Admin");
            if (cocktail.Creator != userId && !isAdmin)
            {
                return Results.Forbid();
            }

            // 1. Prima carica tutte le entità correlate
            var instructionsKey = cocktail.InstructionsKey;

            // 2. Trova e rimuovi le relazioni con gli ingredienti e le misure
            var cocktailIngredients = await dbContext.CocktailsIngredients
                .Where(ci => ci.CocktailKey == id.Value)
                .Include(ci => ci.Measure)
                .ToListAsync();

            foreach (var ci in cocktailIngredients)
            {
                // Rimuovi la misura associata
                if (ci.Measure != null)
                {
                    dbContext.Measures.Remove(ci.Measure);
                }

                // Rimuovi la relazione
                dbContext.CocktailsIngredients.Remove(ci);
            }

            // 3. Rimuovi il cocktail stesso
            dbContext.Cocktails.Remove(cocktail);

            // Salva tutte le modifiche
            await dbContext.SaveChangesAsync();

            // 4. Rimuovi le istruzioni associate
            var instructions = await dbContext.Instructions.FindAsync(cocktail.InstructionsKey);
            if (instructions != null)
            {
                dbContext.Instructions.Remove(instructions);
                await dbContext.SaveChangesAsync();
            }

            return Results.NoContent();
        }



        // Classe per i dati delle richieste
        public class CocktailRequest
        {
            // Informazioni di base del cocktail
            public string? Name { get; set; }
            public string? Category { get; set; }
            public string? Iba { get; set; } // International Bartender Association classification
            public bool? IsAlcoholic { get; set; }
            public string? ImageUrl { get; set; }
            public string? ImageSource { get; set; }
            public string? ImageAttribution { get; set; }
            public string? Tags { get; set; }

            // Bicchiere
            public string? GlassName { get; set; }

            // Istruzioni in diverse lingue
            public InstructionsDto? Instructions { get; set; }

            // Lista di ingredienti con le loro misure
            public List<IngredientWithMeasureDto>? Ingredients { get; set; }

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
            ClaimsPrincipal user,
            CocktailsDbContext dbContext,
            UserManager<IdentityUserExtended> userManager)
        {
            var name = data.SearchString?.ToLower();
            if (string.IsNullOrWhiteSpace(name))
            {
                return Results.BadRequest("Search string cannot be empty.");
            }
            int pageSize = data.PageSize.HasValue && data.PageSize.Value > 0 ? Math.Min(data.PageSize.Value, 50) : 20;
            int page = data.Page.HasValue && data.Page.Value > 0 ? data.Page.Value : 1;
            int skip = (page - 1) * pageSize;

            var query = dbContext.Cocktails.AsQueryable();

            #region "control to show users' cocktails only to logged in users and if showOnlyOriginal is true"
            var userId = user.FindFirst("UserID")?.Value;
            bool isAuthenticated = userId != null;
            bool showOnlyOriginal = !string.IsNullOrWhiteSpace(data.showOnlyOriginal) &&
                      data.showOnlyOriginal.ToLower() == "true";

            if (!isAuthenticated || showOnlyOriginal)
            {
                query = query.Where(c => c.Creator == null);
            }
            #endregion

            query = query.Where(c => c.Name.ToLower().Contains(name));

            bool allIngredients = !string.IsNullOrWhiteSpace(data.AllIngredients) &&
                      data.AllIngredients.ToLower() == "true";

            if (data.Ingredients != null && data.Ingredients.Length > 0)
            {
                if (allIngredients)
                {
                    foreach (var ingredient in data.Ingredients)
                    {
                        query = query.Where(c => c.CocktailIngredients.Any(ci =>
                            ci.Ingredient.Name == ingredient));
                    }
                }
                else
                {
                    var ingredientsList = data.Ingredients.ToArray();
                    query = query.Where(c => c.CocktailIngredients.Any(ci =>
                        ingredientsList.Contains(ci.Ingredient.Name)));
                }
            }

            if (!string.IsNullOrWhiteSpace(data.IsAlcoholic))
            {
                if (!(data.IsAlcoholic.ToLower() == "nopreference"))
                {
                    bool isAlcoholic = data.IsAlcoholic.ToLower() == "alcoholic";
                    query = query.Where(c => c.IsAlcoholic == isAlcoholic);
                }
            }

            if (data.GlassNames != null && data.GlassNames.Length > 0)
            {
                var glassNames = data.GlassNames.ToArray();
                query = query.Where(c => c.Glass != null &&
                    glassNames.Contains(c.Glass.Name));
            }

            #region "creators filter. check if the user has drinks as private (showOnlyOriginal ignored)"
            if (data.Creators != null && data.Creators.Length > 0)
            {
                if (!isAuthenticated)
                    return Results.BadRequest(new { error = "you need to be logged to see users' drinks" });

                var creators = data.Creators.ToArray();
                var userEntity = await userManager.FindByIdAsync(userId);
                string currentUserName = userEntity?.UserName ?? string.Empty;

                var allowedCreators = new List<string>();

                foreach (var creatorName in creators)
                {
                    if (creatorName == currentUserName)
                    {
                        allowedCreators.Add(creatorName);
                        continue;
                    }

                    //controlla se l'utente con questo username ha acconsentito a mostrare i suoi drink
                    var userobj = await userManager.FindByNameAsync(creatorName);
                    if (userobj == null)
                    {
                        return Results.NotFound(new { user = creatorName, error = "User not found" });
                    }
                    var showAccepted = userobj.ShowMyCocktails;
                    if (!showAccepted)
                    {
                        return Results.BadRequest(new { user = creatorName, error = "User's drinks are private" });
                    }
                    allowedCreators.Add(creatorName);
                }
                if (allowedCreators.Count == 0)
                {
                    return Results.BadRequest(new { error = "No valid creators found" });
                }
                query = query.Where(c => c.Creator != null &&
                    allowedCreators.Contains(c.Creator));
            }
            #endregion

            if (data.Categories != null && data.Categories.Length > 0)
            {
                var categoriesList = data.Categories.ToArray();
                query = query.Where(c => c.Category != null &&
                    categoriesList.Contains(c.Category.Name));
            }

            if (!allIngredients && data.Ingredients != null && data.Ingredients.Length > 0)
            {
                var ingredientsList = data.Ingredients.ToArray();

                var cocktails = await query
                    .OrderByDescending(c => c.Name.ToLower().StartsWith(name))
                    .ThenByDescending(c => c.CocktailIngredients.Count(ci =>
                        ingredientsList.Contains(ci.Ingredient.Name)))
                    .ThenBy(c => c.Name)
                    .Include(c => c.Glass)
                    .Include(c => c.Category)
                    .Include(c => c.Instructions)
                    .Include(c => c.CocktailIngredients)
                        .ThenInclude(ci => ci.Ingredient)
                    .Include(c => c.CocktailIngredients)
                        .ThenInclude(ci => ci.Measure)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                var result = cocktails.Select(c => new
                {
                    c.Id,
                    c.Name,
                    Category = c.Category?.Name,
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
                        MetricMeasure = ci.Measure.Metric,
                        ImperialMeasure = ci.Measure.Imperial
                    }).ToList(),
                    MatchingIngredients = c.CocktailIngredients.Count(ci =>
                        ingredientsList.Contains(ci.Ingredient.Name))
                }).ToList();

                return Results.Ok(result);
            }
            else
            {
                // Comportamento standard per AllIngredients=true o quando non ci sono ingredienti
                var cocktails = await query
                    .OrderByDescending(c => c.Name.ToLower().StartsWith(name))
                    .ThenBy(c => c.Name)
                    .Include(c => c.Glass)
                    .Include(c => c.Category)
                    .Include(c => c.Instructions)
                    .Include(c => c.CocktailIngredients)
                        .ThenInclude(ci => ci.Ingredient)
                    .Include(c => c.CocktailIngredients)
                        .ThenInclude(ci => ci.Measure)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                var result = cocktails.Select(c => new
                {
                    c.Id,
                    c.Name,
                    Category=c.Category?.Name,
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
                        MetricMeasure = ci.Measure.Metric,
                        ImperialMeasure = ci.Measure.Imperial
                    }).ToList()
                }).ToList();

                return Results.Ok(result);
            }
        }


        [AllowAnonymous] 
        private static async Task<IResult> ShowAllCocktails(
            [AsParameters] DataForAllQuery data,
            CocktailsDbContext dbContext)
        {
            int pageSize = data.PageSize.HasValue && data.PageSize.Value > 0 ? Math.Min(data.PageSize.Value, 50) : 20;
            int page = data.Page.HasValue && data.Page.Value > 0 ? data.Page.Value : 1;
            int skip = (page - 1) * pageSize;

            var query = dbContext.Cocktails.AsQueryable();

            if (data.OrderBy == "random")
            {
                query = query.OrderBy(c => Guid.NewGuid());
            }
            else if(data.OrderBy == "id")
            {
                query = query.OrderBy(c => c.Id);
            }
            else
            {
                query = query.OrderBy(c => c.Name.ToLower())
                    .ThenBy(c => c.Name);
            }

            var cocktails = await query
                .Include(c => c.Glass)
                .Include(c => c.Category)
                .Include(c => c.Instructions)
                .Include(c => c.CocktailIngredients)
                    .ThenInclude(ci => ci.Ingredient)
                .Include(c => c.CocktailIngredients)
                    .ThenInclude(ci => ci.Measure)
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();

            var result = cocktails.Select(c => new
            {
                c.Id,
                c.Name,
                Category = c.Category?.Name,
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
                    MetricMeasure = ci.Measure.Metric,
                    ImperialMeasure = ci.Measure.Imperial
                }).ToList()
            }).ToList();

            return Results.Ok(result);
        }

        [AllowAnonymous]
        private static async Task<IResult> SearchById(
            long? id,
            ClaimsPrincipal user,
            CocktailsDbContext dbContext,
            UserCocktailService userCocktailService = null)
        {
            if (!id.HasValue)
            {
                return Results.BadRequest(new { message = "ID del cocktail non valido o non specificato" });
            }

            var cocktail = await dbContext.Cocktails
                .Where(c => c.Id == id.Value)
                .Include(c => c.Glass)
                .Include(c => c.Category)
                .Include(c => c.Instructions)
                .Include(c => c.CocktailIngredients)
                    .ThenInclude(ci => ci.Ingredient)
                .Include(c => c.CocktailIngredients)
                    .ThenInclude(ci => ci.Measure)
                .FirstOrDefaultAsync();

            if (cocktail == null)
                return Results.NotFound();

            var isInFavorites = false;
            var userId = user.FindFirst("UserID")?.Value;
            if (userId != null && userCocktailService != null)
            {
                await userCocktailService.AddToSearchHistoryAsync(userId, id.Value);
                isInFavorites = await userCocktailService.CheckIfInFavoritesAsync(userId, id.Value);
            }

            var result = new
            {
                cocktail.Id,
                cocktail.Name,
                Category = cocktail.Category?.Name,
                favorite = isInFavorites,
                cocktail.IsAlcoholic,
                Glass = cocktail.Glass?.Name,
                Instructions = new
                {
                    En = cocktail.Instructions?.En,
                    Es = cocktail.Instructions?.Es,
                    De = cocktail.Instructions?.De,
                    Fr = cocktail.Instructions?.Fr,
                    It = cocktail.Instructions?.It
                },
                cocktail.ImageUrl,
                Ingredients = cocktail.CocktailIngredients.Select(ci => new
                {
                    Ingredient = ci.Ingredient.Name,
                    MetricMeasure = ci.Measure.Metric,
                    ImperialMeasure = ci.Measure.Imperial
                }).ToList()
            };

            return Results.Ok(result);
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
        public string? IsAlcoholic { get; set; }
        public string[]? GlassNames { get; set; }
        public string[]? Creators { get; set; } // per username (per i propri mandi il proprio username). e guardare come mettere piu filtri dello stesso tipo. ad esempio piu glassname
        public string[]? Categories { get; set; }
        public string[]? Ingredients { get; set; }
        public string? AllIngredients { get; set; } //false se non specificato. vuol dire che se ci sono più ingredienti come parametro, allora se true devono esserci tutti in un drink
        public string? showOnlyOriginal { get; set; } //false se non specificato (o non loggato). true se non vuoi vedere i drink creati da altri utenti, compresi i propri.
    }

    public class DataForAllQuery
    {
        public int? PageSize { get; set; }
        public int? Page { get; set; }

        [System.ComponentModel.Description("Parametro per specificare l'ordinamento: \"name\" (predefinito), \"id\", \"random\"")]
        public string? OrderBy { get; set; } //name (default), id, random
    }
}
