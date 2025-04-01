using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using terranova.Server.Models;

namespace terranova.Server.Data
{
    public class CocktailSeeder
    {
        public static void Seed(CocktailsDbContext context)
        {
            if (!context.Cocktails.Any())
            {
                var filePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "alldrinks.json");
                var jsonData = File.ReadAllText(filePath);
                var cocktails = JsonConvert.DeserializeObject<List<CocktailJsonModel>>(jsonData);

                foreach (var cocktailJson in cocktails)
                {
                    var glass = context.Glasses.FirstOrDefault(g => g.Name == cocktailJson.Glass.Name) ?? new Glass
                    {
                        Name = cocktailJson.Glass.Name,
                        Measure = cocktailJson.Glass.Volume_ml.ToString()
                    };

                    var instructions = new Instructions
                    {
                        En = cocktailJson.Instructions.En,
                        Es = cocktailJson.Instructions.Es,
                        De = cocktailJson.Instructions.De,
                        Fr = cocktailJson.Instructions.Fr,
                        It = cocktailJson.Instructions.It
                    };

                    var cocktail = new Cocktail
                    {
                        OldId = !string.IsNullOrEmpty(cocktailJson.IdDrink) ?
                            Convert.ToInt64(cocktailJson.IdDrink) : null,
                        Name = cocktailJson.StrDrink,
                        Category = cocktailJson.StrCategory,
                        Iba = cocktailJson.StrIBA,
                        IsAlcoholic = cocktailJson.StrAlcoholic == "Alcoholic",
                        ImageUrl = cocktailJson.StrDrinkThumb,
                        ImageSource = cocktailJson.StrImageSource,
                        ImageAttribution = cocktailJson.StrImageAttribution,
                        Tags = cocktailJson.StrTags,
                        DateModified = !string.IsNullOrEmpty(cocktailJson.DateModified) ?
                            (long?)new DateTimeOffset(DateTime.Parse(cocktailJson.DateModified)).ToUnixTimeSeconds() :
                            null,
                        Glass = glass,
                        Instructions = instructions
                    };

                    foreach (var ingredientJson in cocktailJson.Ingredients)
                    {
                        var ingredient = context.Ingredients.FirstOrDefault(i => i.Name == ingredientJson.Name) ?? new Ingredient
                        {
                            Name = ingredientJson.Name
                        };

                        var cocktailIngredient = new CocktailIngredient
                        {
                            Ingredient = ingredient,
                            MeasureIM = ingredientJson.MeasureIM,
                            MeasureMT = ingredientJson.MeasureMT
                        };

                        cocktail.CocktailIngredients.Add(cocktailIngredient);
                    }

                    context.Cocktails.Add(cocktail);
                }

                context.SaveChanges();
            }
        }
    }

    public class CocktailJsonModel
    {
        public int Id { get; set; }
        public string IdDrink { get; set; }
        public string StrDrink { get; set; }
        public string StrDrinkAlternate { get; set; }
        public string StrTags { get; set; }
        public string StrVideo { get; set; }
        public string StrCategory { get; set; }
        public string StrIBA { get; set; }
        public string StrAlcoholic { get; set; }
        public string StrDrinkThumb { get; set; }
        public string StrImageSource { get; set; }
        public string StrImageAttribution { get; set; }
        public string StrCreativeCommonsConfirmed { get; set; }
        public string DateModified { get; set; }
        public List<IngredientJsonModel> Ingredients { get; set; }
        public GlassJsonModel Glass { get; set; }
        public InstructionsJsonModel Instructions { get; set; }
    }

    public class IngredientJsonModel
    {
        public string Name { get; set; }
        public string MeasureIM { get; set; }
        public string MeasureMT { get; set; }
    }

    public class GlassJsonModel
    {
        public string Name { get; set; }
        public int Volume_ml { get; set; }
    }

    public class InstructionsJsonModel
    {
        public string En { get; set; }
        public string Es { get; set; }
        public string De { get; set; }
        public string Fr { get; set; }
        public string It { get; set; }
    }
}


