using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading.Tasks;
using terranova.Server.Models;

namespace terranova.Server.Seeder
{
    public class RoleSeeder
    {
        public static async Task SeedRoles(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            string[] roleNames = { "Admin", "User", "Premium" };

            foreach (var roleName in roleNames)
            {
                // Verify if the role already exists
                var roleExists = await roleManager.RoleExistsAsync(roleName);
                if (!roleExists)
                {
                    // Create the role
                    var result = await roleManager.CreateAsync(new IdentityRole(roleName));
                    if (result.Succeeded)
                    {
                        Console.WriteLine($"Ruolo '{roleName}' creato con successo.");
                    }
                    else
                    {
                        Console.WriteLine($"Errore nella creazione del ruolo '{roleName}':");
                        foreach (var error in result.Errors)
                        {
                            Console.WriteLine($"- {error.Description}");
                        }
                    }
                }
            }
        }

        // create an admin user if it doesn't exist
        public static async Task SeedAdminUser(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUserExtended>>();
            var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

            var credentials = configuration.GetSection("AdminCredentials");
            var adminUsername = credentials["Username"];
            var adminEmail = credentials["Email"];
            var adminPassword = credentials["Password"];

            if (string.IsNullOrEmpty(adminUsername) ||
                string.IsNullOrEmpty(adminEmail) ||
                string.IsNullOrEmpty(adminPassword))
            {
                Console.WriteLine("Credenziali admin non trovate nel file di configurazione.");
                return;
            }

            // Verify if the admin user already exists
            var adminUser = await userManager.FindByNameAsync(adminUsername);
            if (adminUser == null)
            {
                // Create the admin user
                var admin = new IdentityUserExtended
                {
                    UserName = adminUsername,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    FullName = "Administrator"
                };

                var result = await userManager.CreateAsync(admin, adminPassword); // Password predefinita
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                    await userManager.AddToRoleAsync(admin, "User");
                    await userManager.AddToRoleAsync(admin, "Premium");

                    Console.WriteLine("Utente admin creato con successo.");
                }
                else
                {
                    Console.WriteLine("Errore nella creazione dell'utente admin:");
                    foreach (var error in result.Errors)
                    {
                        Console.WriteLine($"- {error.Description}");
                    }
                }
            }
        }
    }
}
