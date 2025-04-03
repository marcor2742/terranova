namespace terranova.Server.Models
{
    public class Glass
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Measure { get; set; }
    }

    public class Instructions
    {
        public long Id { get; set; }
        public string? En { get; set; }
        public string? Es { get; set; }
        public string? De { get; set; }
        public string? Fr { get; set; }
        public string? It { get; set; }
    }

    public class Cocktail
    {
        public long Id { get; set; }
        public long? OldId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public bool IsAlcoholic { get; set; }
        public long GlassKey { get; set; }
        public long InstructionsKey { get; set; }
        public long? DateModified { get; set; }
        public string? ImageUrl { get; set; }
        public string? ImageSource { get; set; }
        public string? ImageAttribution { get; set; }
        public string? Tags { get; set; }
        public string? Iba { get; set; }
        public string? Creator { get; set; }

        public Glass? Glass { get; set; }
        public Instructions? Instructions { get; set; }
        public List<CocktailIngredient> CocktailIngredients { get; set; } = new();
    }

    public class Ingredient
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Info { get; set; }

        public List<CocktailIngredient> CocktailIngredients { get; set; } = new();
    }

    public class Measure
    {
        public long Id { get; set; }
        public string? Imperial { get; set; }
        public string? Metric { get; set; }

        public List<CocktailIngredient> CocktailIngredients { get; set; } = new();
    }

    public class CocktailIngredient
    {
        public long CocktailKey { get; set; }
        public long IngredientsKey { get; set; }
        public long MeasureKey { get; set; }

        public Cocktail? Cocktail { get; set; }
        public Ingredient? Ingredient { get; set; }
        public Measure? Measure { get; set; }
    }
}
