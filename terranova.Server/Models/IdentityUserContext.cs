using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace terranova.Server.Models
{
    public class IdentityUserContext: IdentityDbContext
    {
        public IdentityUserContext(DbContextOptions<IdentityUserContext> options): base(options) 
        { }

        public DbSet<IdentityUserExtended> IdentityUserExtended { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<SearchHistory> SearchHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Favorite>(entity =>
            {
                entity.ToTable("Favorites");
                entity.HasKey(f => f.Id);

                entity.HasIndex(f => new { f.UserId, f.CocktailId }).IsUnique();

                entity.HasOne(f => f.User)
                      .WithMany(u => u.Favorites)
                      .HasForeignKey(f => f.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                //no cocktailId becasue it is in the cocktail context
            });

            builder.Entity<SearchHistory>(entity =>
            {
                entity.ToTable("SearchHistories");
                entity.HasKey(sh => sh.Id);

                entity.HasIndex(sh => new { sh.UserId, sh.CocktailId });

                entity.HasOne(sh => sh.User)
                      .WithMany(u => u.SearchHistories)
                      .HasForeignKey(sh => sh.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                //no cocktailId becasue it is in the cocktail context
            });
        }

    }
}
