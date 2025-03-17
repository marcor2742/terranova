using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace terranova.Server.Models
{
    public class IdentityUserContext: IdentityDbContext
    {
        public IdentityUserContext(DbContextOptions<IdentityUserContext> options): base(options) 
        { }

        public DbSet<IdentityUserExtended> IdentityUserExtended { get; set; }
    }
}
