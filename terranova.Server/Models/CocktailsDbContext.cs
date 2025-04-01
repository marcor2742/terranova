using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace terranova.Server.Models
{
    public class CocktailsDbContext: DbContext
    {
        public DbSet<Cocktail> Cocktails { get; set; }
        public DbSet<Ingredient> Ingredients { get; set; }
        public DbSet<CocktailIngredient> CocktailsIngredients { get; set; }
        public DbSet<Glass> Glasses { get; set; }
        public DbSet<Instructions> Instructions { get; set; }

        public CocktailsDbContext(DbContextOptions<CocktailsDbContext> options)
            : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<IdentityUser>()
                .ToTable("AspNetUsers", t => t.ExcludeFromMigrations());

            //relation of cocktail - glass, instructions, creator (userId)
            modelBuilder.Entity<Cocktail>()
                .HasOne(c => c.Glass)
                .WithMany()
                .HasForeignKey(c => c.GlassKey)
                .IsRequired(false);

            modelBuilder.Entity<Cocktail>()
                .HasOne(c => c.Instructions)
                .WithMany()
                .HasForeignKey(c => c.InstructionsKey)
                .IsRequired(false);

            modelBuilder.Entity<Cocktail>()
                .HasOne<IdentityUser>()
                .WithMany()
                .HasForeignKey(c => c.Creator)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            // Configuration for Many-to-Many relationship of cocktailIngredient
            modelBuilder.Entity<CocktailIngredient>()
                .HasKey(ci => new { ci.CocktailKey, ci.IngredientsKey });

            modelBuilder.Entity<CocktailIngredient>()
                .HasOne(ci => ci.Cocktail)
                .WithMany(c => c.CocktailIngredients)
                .HasForeignKey(ci => ci.CocktailKey);

            modelBuilder.Entity<CocktailIngredient>()
                .HasOne(ci => ci.Ingredient)
                .WithMany(i => i.CocktailIngredients)
                .HasForeignKey(ci => ci.IngredientsKey);
        }
    }
}
