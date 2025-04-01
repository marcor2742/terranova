using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using terranova.Server.Models;

namespace terranova.Server.Seeder
{
    public class Cocktailseeder
    {
        public static async Task SeedAsync(CocktailsDbContext context, string jsonFilePath)
        {
            if (!await context.Cocktails.AnyAsync())
            {
                var json = await File.ReadAllTextAsync(jsonFilePath);
                var cocktails = JsonSerializer.Deserialize<List<CocktailJsonModel>>(json);

                foreach (var cocktail in cocktails)
                {
                    var glass = await context.Glasses.FirstOrDefaultAsync(g => g.Name == cocktail.Glass.Name)
                                ?? new Glass { Name = cocktail.Glass.Name };

                    var instructions = new Instructions
                    {
                        En = cocktail.Instructions.En,
                        Es = cocktail.Instructions.Es,
                        De = cocktail.Instructions.De,
                        Fr = cocktail.Instructions.Fr,
                        It = cocktail.Instructions.It
                    };

                    var newCocktail = new Cocktail
                    {
                        Name = cocktail.StrDrink,
                        Category = cocktail.StrCategory,
                        IsAlcoholic = cocktail.StrAlcoholic == "Alcoholic",
                        ImageUrl = cocktail.StrDrinkThumb,
                        Tags = cocktail.StrTags,
                        Iba = cocktail.StrIBA,
                        DateModified = long.TryParse(cocktail.DateModified?.Replace(":", ""), out var date) ? date : null,
                        Glass = glass,
                        Instructions = instructions
                    };

                    context.Cocktails.Add(newCocktail);
                    await context.SaveChangesAsync();

                    foreach (var ingredient in cocktail.Ingredients)
                    {
                        var dbIngredient = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == ingredient.Name)
                                           ?? new Ingredient { Name = ingredient.Name };

                        var cocktailIngredient = new CocktailIngredient
                        {
                            CocktailKey = newCocktail.Id,
                            IngredientsKey = dbIngredient.Id,
                            MeasureIM = ingredient.MeasureIM,
                            MeasureMT = ingredient.MeasureMT
                        };

                        context.CocktailsIngredients.Add(cocktailIngredient);
                    }
                }

                await context.SaveChangesAsync();
            }
        }
    }
}

//in Program.cs
//using (var scope = app.Services.CreateScope())
//{
//    var context = scope.ServiceProvider.GetRequiredService<CocktailsDbContext>();
//    await DatabaseSeeder.SeedAsync(context, "Data/cocktails.json");
//}
