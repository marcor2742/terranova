using Microsoft.EntityFrameworkCore;
using terranova.Server.Models;

namespace terranova.Server.Extensions
{
    public static class EFCoreExtensions
    {
        public static IServiceCollection InjectDbContext(
                this IServiceCollection services, IConfiguration config)
        {
            services.AddDbContext<IdentityUserContext>(options => 
                options.UseSqlServer(config.GetConnectionString("DevDB")));
            return services;
        }
    }
}
