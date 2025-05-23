﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NuGet.Common;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using terranova.Server.Models;

namespace terranova.Server.Controllers
{
    public static class IdentityUserControllerExtensions
    {
        public static IEndpointRouteBuilder MapIdentityUserEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapPost("/registerextended", CreateUser) //.AllowAnonymous()
            .WithDescription("Registra l'utente. Sostituisce il /register di ASP.NET Core Identity")
               .WithOpenApi();

            app.MapPost("/loginextended", SignIn)
            .WithDescription("Fa accedere l'utente. Sostituisce il /login di ASP.NET Core Identity")
               .WithOpenApi();

            app.MapPost("/refreshextended", RefreshToken)
            .WithDescription("Restituisce un nuovo access Token avendo il refresh Token. Sostituisce il /refresh di ASP.NET Core Identity")
               .WithOpenApi();

            app.MapPost("/logoutextended", Logout)
            .WithDescription("Rimuove il refresh Token dal Database. Sostituisce il /logout di ASP.NET Core Identity")
               .WithOpenApi();

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


            if (!result.Succeeded)
            {
                var errors = result.Errors.ToList();
                if (errors.Count == 0)
                {
                    return Results.BadRequest(new { message = "Errore sconosciuto" });
                }

                var errorDict = new Dictionary<string, string>();

                foreach (var error in errors)
                {
                    errorDict.Add(error.Code, error.Description);
                }

                return Results.BadRequest(errorDict);
            }
            await userManager.AddToRoleAsync(user, "user");

            return Results.Ok(new { message = "Utente registrato con successo" });
            //return Results.BadRequest(new { errors = result.Errors });
            //return Results.BadRequest(result);
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
                if (string.IsNullOrEmpty(model.Password) && user == null)
                {
                    return Results.BadRequest(new { exist = false, message = "Register" });
                }
            }
            else if (!string.IsNullOrEmpty(model.Username))
            {
                user = await userManager.FindByNameAsync(model.Username);
                if (string.IsNullOrEmpty(model.Password) && user == null)
                {
                    return Results.BadRequest(new { exist = false, message = "Register" });
                }
            }

            if (user != null && await userManager.CheckPasswordAsync(user, model.Password))
            {
                var (token, refreshToken) = await TokenGenerator.makeTokens(user, userManager, appSettings);
                return Results.Ok(new { token, refreshToken });
            }
            return Results.BadRequest(new { message = "Email o password errati" });
        }

        [AllowAnonymous]
        private static async Task<IResult> RefreshToken(
           UserManager<IdentityUserExtended> userManager,
           [FromBody] RefreshTokenRequest request,
           IOptions<AppSettings> appSettings)
        {
            if (string.IsNullOrEmpty(request.RefreshToken))
            {
                return Results.BadRequest(new { message = "Refresh token è obbligatorio" });
            }

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(request.RefreshToken);
                var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "UserID");
                if (userIdClaim == null)
                {
                    return Results.BadRequest(new { message = "Refresh token non valido" });
                }
                var userId = userIdClaim.Value;
                var user = await userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return Results.BadRequest(new { message = "Utente non trovato" });
                }

                // Verifica il refresh token
                var storedToken = await userManager.GetAuthenticationTokenAsync(
                    user,
                    "Default",
                    "RefreshToken"
                );

                if (request.RefreshToken != storedToken)
                {
                    return Results.BadRequest(new { message = "Refresh token non valido" });
                }

                // Genera un nuovo access token
                var roles = await userManager.GetRolesAsync(user);
                var claims = new List<Claim>
                {
                    new Claim("UserID", user.Id.ToString()),
                };

                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                    claims.Add(new Claim("Language", user.Language.ToString()!));
                    claims.Add(new Claim("MeasurementSystem", user.MeasurementSystem.ToString()!));
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
                    Expires = DateTime.UtcNow.AddMinutes(20),
                    SigningCredentials = new SigningCredentials(signInKey, SecurityAlgorithms.HmacSha256Signature)
                };
                var tokenHandler = new JwtSecurityTokenHandler();
                var securityToken = tokenHandler.CreateToken(tokenDescriptor);
                var newToken = tokenHandler.WriteToken(securityToken);

                // nuovo refresh token
                var newRefreshToken = new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
                           claims: new[] { new Claim("UserID", user.Id.ToString()) },
                           expires: DateTime.UtcNow.AddDays(7),
                           signingCredentials: new SigningCredentials(signInKey, SecurityAlgorithms.HmacSha256Signature)
                       ));
                await userManager.SetAuthenticationTokenAsync(user, "Default", "RefreshToken", newRefreshToken);

                return Results.Ok(new { token = newToken, refreshToken = newRefreshToken });
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { message = $"Errore durante il refresh: {ex.Message}" });
            }
        }
        public class RefreshTokenRequest
        {
            [Required]
            public string RefreshToken { get; set; } = string.Empty;
        }

        //remove refresh token from db
        private static async Task<IResult> Logout(
            UserManager<IdentityUserExtended> userManager,
            ClaimsPrincipal user)
        {
            var userId = user.FindFirst("UserID")?.Value;
            if (userId == null)
            {
                return Results.BadRequest(new { message = "Utente non trovato" });
            }
            var identityUser = await userManager.FindByIdAsync(userId);
            if (identityUser == null)
            {
                return Results.BadRequest(new { message = "Utente non trovato" });
            }
            await userManager.SetAuthenticationTokenAsync(identityUser, "Default", "RefreshToken", null);
            return Results.Ok(new { message = "Logout effettuato con successo" });
        }
    }

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
        public string? Email { get; set; }
        public string? Username { get; set; }
        public string Password { get; set; } = string.Empty;
    }
}
