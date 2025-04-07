using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using terranova.Server.Models;

namespace terranova.Server.Controllers
{
    public class TokenGenerator
    {
        public static int CalculateAge(DateOnly birthDate)
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.Today);
            int age = today.Year - birthDate.Year;

            if (birthDate > today.AddYears(-age))
            {
                age--;
            }

            return age;
        }

        public static async Task<(string token, string refreshToken)> makeTokens(
            IdentityUserExtended userDetails,
            UserManager<IdentityUserExtended> userManager,
            IOptions<AppSettings> appSettings)
        {
            // Genera il token esattamente come in SignIn
            var roles = await userManager.GetRolesAsync(userDetails);
            var claims = new List<Claim>
                    {
                        new Claim("UserID", userDetails.Id.ToString()),
                    };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            claims.Add(new Claim("Language", userDetails.Language.ToString()!));
            claims.Add(new Claim("MeasurementSystem", userDetails.MeasurementSystem.ToString()!));

            if (userDetails.BirthDate.HasValue)
            {
                int age = CalculateAge(userDetails.BirthDate.Value);
                claims.Add(new Claim("Age", age.ToString()));
                claims.Add(new Claim(age >= 18 ? "Over18" : "Under18", "true"));
            }

            if (userDetails.AlcoholContentPreference.HasValue)
            {
                claims.Add(new Claim("AlcoholContentPreference", userDetails.AlcoholContentPreference.ToString()!));
            }

            if (userDetails.GlassPreference != null)
            {
                claims.Add(new Claim("GlassPreference", userDetails.GlassPreference));
            }

            if (userDetails.BaseIngredientPreference != null)
            {
                claims.Add(new Claim("BaseIngredientPreference", userDetails.BaseIngredientPreference));
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
            var token = tokenHandler.WriteToken(securityToken);

            // refresh token
            var refreshToken = new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
                claims: new[] { new Claim("UserId", userDetails.Id) },
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: new SigningCredentials(signInKey, SecurityAlgorithms.HmacSha256Signature)
            ));

            await userManager.SetAuthenticationTokenAsync(userDetails, "Default", "RefreshToken", refreshToken);

            return (token, refreshToken);
        }
    }
}
