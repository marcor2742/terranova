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
                try
                {
                    var filePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "alldrinks.json");
                    var jsonData = File.ReadAllText(filePath);
                    var cocktails = JsonConvert.DeserializeObject<List<CocktailJsonModel>>(jsonData);

                    // Passo 1: Aggiungi tutti i bicchieri
                    var allGlassesDict = new Dictionary<string, Glass>();
                    foreach (var cocktailJson in cocktails)
                    {
                        if (cocktailJson.Glass == null || string.IsNullOrEmpty(cocktailJson.Glass.Name)) continue;

                        var glassName = cocktailJson.Glass.Name.Trim().ToLower();
                        if (!allGlassesDict.ContainsKey(glassName))
                        {
                            var glass = new Glass
                            {
                                Name = cocktailJson.Glass.Name.Trim(),
                                Measure = cocktailJson.Glass.Volume_ml.ToString()
                            };
                            allGlassesDict.Add(glassName, glass);
                            context.Glasses.Add(glass);
                        }
                    }
                    context.SaveChanges();

                    // Passo 1.5: Aggiungi tutte le categorie
                    var allCategoriesDict = new Dictionary<string, Category>();
                    foreach (var cocktailJson in cocktails)
                    {
                        if (cocktailJson.StrCategory == null || string.IsNullOrEmpty(cocktailJson.StrCategory)) continue;

                        var categoryName = cocktailJson.StrCategory.Trim().ToLower();
                        if (!allCategoriesDict.ContainsKey(categoryName))
                        {
                            var category = new Category { Name = cocktailJson.StrCategory.Trim() };
                            allCategoriesDict.Add(categoryName, category);
                            context.Categories.Add(category);
                        }
                    }
                    context.SaveChanges();

                    // Passo 2: Aggiungi tutti gli ingredienti
                    var allIngredientsDict = new Dictionary<string, Ingredient>();
                    foreach (var cocktailJson in cocktails)
                    {
                        if (cocktailJson.Ingredients == null) continue;

                        foreach (var ingredientJson in cocktailJson.Ingredients)
                        {
                            if (string.IsNullOrEmpty(ingredientJson.Name)) continue;

                            var ingredientName = ingredientJson.Name.Trim().ToLower();
                            if (!allIngredientsDict.ContainsKey(ingredientName))
                            {
                                var ingredient = new Ingredient { Name = ingredientJson.Name.Trim() };
                                allIngredientsDict.Add(ingredientName, ingredient);
                                context.Ingredients.Add(ingredient);
                            }
                        }
                    }
                    context.SaveChanges();

                    // Carica tutti i bicchieri e ingredienti salvati per avere i loro ID
                    var glassesDict = context.Glasses.ToDictionary(g => g.Name.ToLower(), g => g.Id);
                    var categoriesDict = context.Categories.ToDictionary(c => c.Name.ToLower(), c => c.Id);
                    var ingredientsDict = context.Ingredients.ToDictionary(i => i.Name.ToLower(), i => i.Id);

                    // Passo 3: Processa i cocktail uno alla volta
                    int index = 0;
                    foreach (var cocktailJson in cocktails)
                    {
                        index++;
                        try
                        {
                            // Verifica che il bicchiere esista
                            if (cocktailJson.Glass == null || string.IsNullOrEmpty(cocktailJson.Glass.Name))
                            {
                                Console.WriteLine($"Skipping cocktail with missing glass: {cocktailJson.StrDrink}");
                                continue;
                            }

                            var glassName = cocktailJson.Glass.Name.Trim().ToLower();
                            if (!glassesDict.ContainsKey(glassName))
                            {
                                Console.WriteLine($"Glass not found for cocktail: {cocktailJson.StrDrink}, glass: {cocktailJson.Glass.Name}");
                                continue;
                            }

                            var glassId = glassesDict[glassName];

                            // Categoria
                            long? categoryId = null;
                            if (!string.IsNullOrEmpty(cocktailJson.StrCategory))
                            {
                                var categoryName = cocktailJson.StrCategory.Trim().ToLower();
                                if (categoriesDict.ContainsKey(categoryName))
                                {
                                    categoryId = categoriesDict[categoryName];
                                }
                            }

                            // Crea le istruzioni
                            var instructions = new Instructions
                            {
                                En = cocktailJson.Instructions?.En,
                                Es = cocktailJson.Instructions?.Es,
                                De = cocktailJson.Instructions?.De,
                                Fr = cocktailJson.Instructions?.Fr,
                                It = cocktailJson.Instructions?.It
                            };

                            context.Instructions.Add(instructions);
                            context.SaveChanges();

                            // Crea il cocktail
                            var cocktail = new Cocktail
                            {
                                OldId = !string.IsNullOrEmpty(cocktailJson.IdDrink) ?
                                    Convert.ToInt64(cocktailJson.IdDrink) : null,
                                Name = cocktailJson.StrDrink,
                                CategoryKey = categoryId,
                                Iba = cocktailJson.StrIBA,
                                IsAlcoholic = cocktailJson.StrAlcoholic == "Alcoholic",
                                ImageUrl = cocktailJson.StrDrinkThumb,
                                ImageSource = cocktailJson.StrImageSource,
                                ImageAttribution = cocktailJson.StrImageAttribution,
                                Tags = cocktailJson.StrTags,
                                DateModified = !string.IsNullOrEmpty(cocktailJson.DateModified) ?
                                    (long?)new DateTimeOffset(DateTime.Parse(cocktailJson.DateModified)).ToUnixTimeSeconds() :
                                    null,
                                GlassKey = glassId,
                                InstructionsKey = instructions.Id
                            };

                            context.Cocktails.Add(cocktail);
                            context.SaveChanges();

                            // Se non ci sono ingredienti, continua
                            if (cocktailJson.Ingredients == null || !cocktailJson.Ingredients.Any())
                            {
                                Console.WriteLine($"Cocktail {index}/{cocktails.Count}: {cocktailJson.StrDrink} (no ingredients)");
                                continue;
                            }

                            // Aggiungi gli ingredienti al cocktail
                            foreach (var ingredientJson in cocktailJson.Ingredients)
                            {
                                if (string.IsNullOrEmpty(ingredientJson.Name)) continue;

                                var ingredientName = ingredientJson.Name.Trim().ToLower();
                                if (!ingredientsDict.ContainsKey(ingredientName))
                                {
                                    Console.WriteLine($"Ingredient not found: {ingredientJson.Name} for cocktail {cocktailJson.StrDrink}");
                                    continue;
                                }

                                var ingredientId = ingredientsDict[ingredientName];

                                // Crea la misura
                                var measure = new Measure
                                {
                                    Imperial = ingredientJson.MeasureIM,
                                    Metric = ingredientJson.MeasureMT
                                };

                                context.Measures.Add(measure);
                                context.SaveChanges();

                                // Crea la relazione CocktailIngredient usando solo chiavi, non oggetti
                                var cocktailIngredient = new CocktailIngredient
                                {
                                    CocktailKey = cocktail.Id,
                                    IngredientsKey = ingredientId,
                                    MeasureKey = measure.Id
                                };

                                context.CocktailsIngredients.Add(cocktailIngredient);
                            }

                            context.SaveChanges();
                            Console.WriteLine($"Processed cocktail {index}/{cocktails.Count}: {cocktailJson.StrDrink}");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error processing cocktail {cocktailJson.StrDrink}: {ex.Message}");
                        }

                        // Pulisci il contesto dopo ogni cocktail
                        context.ChangeTracker.Clear();
                    }

                    Console.WriteLine("Seeding completed successfully!");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"General seeding error: {ex.Message}");
                    throw;
                }
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


