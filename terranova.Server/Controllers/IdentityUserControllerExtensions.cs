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
    }

    public class UserLoginningModel
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public static class IdentityUserControllerExtensions
    {
        public static IEndpointRouteBuilder MapIdentityUserEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapPost("/registerextended", CreateUser);

            app.MapPost("/loginextended", SignIn);

            return app;
        }

        private static async Task<IResult> CreateUser(UserManager<IdentityUserExtended> userManager,
            [FromBody] UserRegistrationModel model) 
        {
            IdentityUserExtended user = new IdentityUserExtended()
            {
                UserName = model.Username,
                Email = model.Email,
                FullName = model.FullName
            };

            var result = await userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                return Results.Ok(new { message = "Utente registrato con successo" });
            }

            //return Results.BadRequest(new { errors = result.Errors });
            return Results.BadRequest(result);
        }

        private static async Task<IResult> SignIn(UserManager<IdentityUserExtended> userManager,
                [FromBody] UserLoginningModel model,
                IOptions<AppSettings> appSettings)
        {
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user != null && await userManager.CheckPasswordAsync(user, model.Password))
            {
                var signInKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appSettings.Value.JWT_Secret));
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                new Claim("UserID", user.Id.ToString()),
                    }),
                    Expires = DateTime.UtcNow.AddDays(1), //AddMinutes(20),
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
