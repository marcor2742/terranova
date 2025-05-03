using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using terranova.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.Extensions.Options;
using terranova.Server.Services;
using terranova.Server.Migrations.IdentityUser;

namespace terranova.Server.Controllers
{
    public static class AccountEndpoints
    {
        public static IEndpointRouteBuilder MapAccountEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("/userProfile", GetUserProfile) //.RequireAuthorization();
               .WithDescription("Restituisce i dati dell'utente")
               .WithOpenApi();

            app.MapPost("/addProfileInfo", AddProfileInfo)
               .WithDescription("Aggiunge i dati dell'utente")
               .WithOpenApi();

            app.MapPost("/uploadProfileImage", UploadProfileImage)
               .WithDescription("carica la foto profilo e cancella quella precedente")
               .WithOpenApi();

            app.MapDelete("/deleteProfileImage", DeleteProfileImage)
               .WithDescription("cancella la foto profilo. (lo fa anche uploadProfileImage per poi sostituire l'immagine)")
               .WithOpenApi();

            return app;
        }

        //[Authorize] //default policy
        private static async Task<IResult> GetUserProfile(ClaimsPrincipal user,
            UserManager<IdentityUserExtended> userManager)
        {
            string userID = user.Claims.First(x => x.Type == "UserID").Value;
            if (userID == null)
            {
                return Results.BadRequest(new { message = "User not found" });
            }
            var userDetails = await userManager.FindByIdAsync(userID);
            if (userDetails == null)
            {
                return Results.BadRequest(new { message = "User not found" });
            }
            return Results.Ok(new
            {
                UserName = userDetails?.UserName,
                Email = userDetails?.Email,
                FullName = userDetails?.FullName,
                AlcoholContentPreference = userDetails?.AlcoholContentPreference,
                BaseIngredientPreference = userDetails?.BaseIngredientPreference,
                Bio = userDetails?.Bio,
                BirthDate = userDetails?.BirthDate,
                GlassPreference = userDetails?.GlassPreference,
                Language = userDetails?.Language,
                MeasurementSystem = userDetails?.MeasurementSystem,
                PropicUrl = userDetails?.PropicUrl,
                ShowMyCocktails = userDetails?.ShowMyCocktails,
            });
        }

        public class ProfileUpdateDto
        {
            public string? FullName { get; set; }
            public DateOnly? BirthDate { get; set; }

            public string? AlcoholContentPreference { get; set; }  // "Alcoholic", "NonAlcoholic", "NoPreference"
            public string? Language { get; set; }                  // "Italian", "English", ecc.
            public string? MeasurementSystem { get; set; }         // "Metric", "Imperial"

            public string? GlassPreference { get; set; }
            public string? BaseIngredientPreference { get; set; }
            public string? Bio { get; set; }
            public string? PropicUrl { get; set; }
            public string? PhoneNumber { get; set; }
            public bool? ShowMyCocktails { get; set; }
        }

        //take some info from the body and add it to the user profile
        private static async Task<IResult> AddProfileInfo(
            ClaimsPrincipal user,
            [FromBody] ProfileUpdateDto userProfile,
            UserManager<IdentityUserExtended> userManager,
            IOptions<AppSettings> appSettings)
        {
            var userId = user.FindFirst("UserID")?.Value;
            if (userId == null)
            {
                return Results.BadRequest(new { message = "User not found" });
            }
            var userDetails = await userManager.FindByIdAsync(userId);
            if (userDetails == null)
            {
                return Results.BadRequest(new { message = "User not found" });
            }

            List<string> validationErrors = new List<string>();
            if (userProfile.FullName?.Length > 150) validationErrors.Add("Il nome completo non può superare i 150 caratteri");
            if (userProfile.Bio?.Length > 150) validationErrors.Add("La bio non può superare i 150 caratteri");
            if (userProfile.GlassPreference?.Length > 150) validationErrors.Add("La preferenza bicchiere non può superare i 150 caratteri");
            if (userProfile.BaseIngredientPreference?.Length > 150) validationErrors.Add("La preferenza ingrediente base non può superare i 150 caratteri");

            AlcoholContentPreference? alcoholPref = null;
            if (!string.IsNullOrEmpty(userProfile.AlcoholContentPreference))
            {
                if (Enum.TryParse<AlcoholContentPreference>(userProfile.AlcoholContentPreference, true, out var parsed))
                {
                    alcoholPref = parsed;
                }
                else
                {
                    validationErrors.Add($"Preferenza contenuto alcolico non valida: {userProfile.AlcoholContentPreference}");
                }
            }

            Language? language = null;
            if (!string.IsNullOrEmpty(userProfile.Language))
            {
                if (Enum.TryParse<Language>(userProfile.Language, true, out var parsed))
                {
                    language = parsed;
                }
                else
                {
                    validationErrors.Add($"Lingua non valida: {userProfile.Language}");
                }
            }

            MeasurementSystem? measurementSystem = null;
            if (!string.IsNullOrEmpty(userProfile.MeasurementSystem))
            {
                if (Enum.TryParse<MeasurementSystem>(userProfile.MeasurementSystem, true, out var parsed))
                {
                    measurementSystem = parsed;
                }
                else
                {
                    validationErrors.Add($"Sistema di misurazione non valido: {userProfile.MeasurementSystem}");
                }
            }

            if (validationErrors.Count > 0)
            {
                return Results.BadRequest(new { message = "Errori di validazione", errors = validationErrors });
            }

            if (userProfile.PhoneNumber != null) userDetails.PhoneNumber = userProfile.PhoneNumber;
            if (userProfile.FullName != null) userDetails.FullName = userProfile.FullName;
            if (userProfile.Bio != null) userDetails.Bio = userProfile.Bio;
            if (userProfile.PropicUrl != null) userDetails.PropicUrl = userProfile.PropicUrl;

            if (alcoholPref.HasValue) userDetails.AlcoholContentPreference = alcoholPref;
            if (language.HasValue) userDetails.Language = language;
            if (measurementSystem.HasValue) userDetails.MeasurementSystem = measurementSystem;

            if (userProfile.BaseIngredientPreference != null) userDetails.BaseIngredientPreference = userProfile.BaseIngredientPreference;
            if (userProfile.GlassPreference != null) userDetails.GlassPreference = userProfile.GlassPreference;
            bool birthDateUpdated = false;
            if (userProfile.BirthDate.HasValue && userDetails.BirthDate != userProfile.BirthDate.Value)
            {
                userDetails.BirthDate = userProfile.BirthDate.Value;
                birthDateUpdated = true;
            }
            if (userProfile.ShowMyCocktails.HasValue) userDetails.ShowMyCocktails = userProfile.ShowMyCocktails.Value;

            var result = await userManager.UpdateAsync(userDetails);

            if (result.Succeeded)
            {
                if (birthDateUpdated)
                {
                    var (token, refreshToken) = await TokenGenerator.makeTokens(userDetails, userManager, appSettings);
                    return Results.Ok(new
                    {
                        message = "Profilo aggiornato con successo",
                        token,
                        refreshToken
                    });
                }
                return Results.Ok(new { message = "Profilo aggiornato con successo" });
            }
            return Results.BadRequest(new { message = "Errore nell'aggiornamento del profilo", errors = result.Errors });
        }

        private static async Task<IResult> UploadProfileImage(
            HttpRequest request,
            ClaimsPrincipal user,
            UserManager<IdentityUserExtended> userManager,
            IAzureStorageService azureStorageService)
        {
            var userId = user.FindFirst("UserID")?.Value;
            if (userId == null)
                return Results.BadRequest(new { message = "User not found" });

            var userDetails = await userManager.FindByIdAsync(userId);
            if (userDetails == null)
                return Results.BadRequest(new { message = "User not found" });

            if (!request.HasFormContentType || request.Form.Files.Count == 0)
                return Results.BadRequest(new { message = "No image file provided" });

            bool isAdmin = user.IsInRole("Admin");
            var file = request.Form.Files[0];

            if (file.Length == 0)
                return Results.BadRequest(new { message = "Empty file" });

            if (!file.ContentType.StartsWith("image/"))
                return Results.BadRequest(new { message = "File is not an image" });

            // delete old image if exists
            if (!string.IsNullOrEmpty(userDetails.PropicUrl))
            {
                await azureStorageService.DeleteProfileImageAsync(userId, userDetails.PropicUrl, isAdmin);
            }

            // upload new image
            using var stream = file.OpenReadStream();
            var imageUrl = await azureStorageService.UploadProfileImageAsync(userId, stream, file.ContentType);

            userDetails.PropicUrl = imageUrl;
            await userManager.UpdateAsync(userDetails);

            return Results.Ok(new { imageUrl });
        }

        private static async Task<IResult> DeleteProfileImage(
            HttpRequest request,
            ClaimsPrincipal user,
            UserManager<IdentityUserExtended> userManager,
            IAzureStorageService azureStorageService)
        {
            var userId = user.FindFirst("UserID")?.Value;
            if (userId == null)
                return Results.BadRequest(new { message = "User not found" });
            var userDetails = await userManager.FindByIdAsync(userId);
            if (userDetails == null)
                return Results.BadRequest(new { message = "User not found" });
            if (string.IsNullOrEmpty(userDetails.PropicUrl))
                return Results.BadRequest(new { message = "No image to delete" });
            bool isAdmin = user.IsInRole("Admin");
            var result = await azureStorageService.DeleteProfileImageAsync(userId, userDetails.PropicUrl, isAdmin);
            if (result)
            {
                userDetails.PropicUrl = null;
                await userManager.UpdateAsync(userDetails);
                return Results.Ok(new { message = "Image deleted successfully" });
            }
            else
            {
                return Results.BadRequest(new { message = "Error deleting image" });
            }

        }

    }
}


