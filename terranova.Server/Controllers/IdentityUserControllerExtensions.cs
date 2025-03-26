using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using terranova.Server.Models;

namespace terranova.Server.Controllers
{
    public class UserRegistrationModel
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        [Required(ErrorMessage = "Username is required")]
        public string Username { get; set; } = string.Empty;
        public string? FullName { get; set; } // opzionale
        public string Role { get; set; } = string.Empty; //non case sensitive
    }

    public class UserLoginningModel
    {
        public string? Email { get; set; }
        public string? Username { get; set; }
        public string Password { get; set; } = string.Empty;
    }

    public static class IdentityUserControllerExtensions
    {
        public static IEndpointRouteBuilder MapIdentityUserEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapPost("/registerextended", CreateUser); //.AllowAnonymous();

            app.MapPost("/loginextended", SignIn);

            return app;
        }

        [AllowAnonymous]
        private static async Task<IResult> CreateUser(UserManager<IdentityUserExtended> userManager,
            [FromBody] UserRegistrationModel model) 
        {
            IdentityUserExtended user = new IdentityUserExtended()
            {
                UserName = model.Username,
                Email = model.Email,
                FullName = model.FullName,
            };

            var result = await userManager.CreateAsync(user, model.Password);

            await userManager.AddToRoleAsync(user, model.Role);

            if (result.Succeeded)
            {
                return Results.Ok(new { message = "Utente registrato con successo" });
            }

            //return Results.BadRequest(new { errors = result.Errors });
            return Results.BadRequest(result);
        }

        [AllowAnonymous]
        private static async Task<IResult> SignIn(UserManager<IdentityUserExtended> userManager,
                [FromBody] UserLoginningModel model,
                IOptions<AppSettings> appSettings)
        {
            IdentityUserExtended? user = null;

            //check if email or username is provided
            if (!string.IsNullOrEmpty(model.Email))
            {
                user = await userManager.FindByEmailAsync(model.Email);
            }
            else if (!string.IsNullOrEmpty(model.Username))
            {
                user = await userManager.FindByNameAsync(model.Username);
            }

            if (user != null && await userManager.CheckPasswordAsync(user, model.Password))
            {
                var roles = await userManager.GetRolesAsync(user);
                var claims = new List<Claim>
                {
                    new Claim("UserID", user.Id.ToString()),
                };
                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                    claims.Add(new Claim("Language", user.Language.ToString()!)); //default is English
                    claims.Add(new Claim("MeasurementSystem", user.MeasurementSystem.ToString()!)); //default is Metric
                }

                if (user.BirthDate.HasValue)
                {
                    DateOnly today = DateOnly.FromDateTime(DateTime.Today);
                    int age = today.Year - user.BirthDate.Value.Year;

                    if (user.BirthDate.Value.Month > today.Month ||
                        (user.BirthDate.Value.Month == today.Month &&
                         user.BirthDate.Value.Day > today.Day))
                    {
                        age--;
                    }

                    claims.Add(new Claim("Age", age.ToString()));
                    claims.Add(new Claim(age >= 18 ? "Over18" : "Under18", "true"));
                }

                if (user.AlcoholContentPreference.HasValue)
                {
                    claims.Add(new Claim("AlcoholContentPreference", user.AlcoholContentPreference.ToString()!));
                }
                if (user.GlassPreference != null)
                {
                    claims.Add(new Claim("GlassPreference", user.GlassPreference));
                }
                if (user.BaseIngredientPreference != null)
                {
                    claims.Add(new Claim("BaseIngredientPreference", user.BaseIngredientPreference));
                }

                var signInKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appSettings.Value.JWT_Secret));
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = DateTime.UtcNow.AddDays(1), //or AddMinutes(20),
                    SigningCredentials = new SigningCredentials(signInKey, SecurityAlgorithms.HmacSha256Signature)
                };
                var tokenHandler = new JwtSecurityTokenHandler();
                var securityToken = tokenHandler.CreateToken(tokenDescriptor);
                var token = tokenHandler.WriteToken(securityToken);
                //return Results.Ok(new { message = "Login effettuato con successo" });
                return Results.Ok(new { token });
            }
            return Results.BadRequest(new { message = "Email o password errati" });
        }
    }
}
