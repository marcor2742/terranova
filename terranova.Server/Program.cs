using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using DotNetEnv;
using System;
using System.IO;
using terranova.Server.Controllers;
using terranova.Server.Data;
using terranova.Server.Extensions;
using terranova.Server.Models;
using terranova.Server.Seeder;
using terranova.Server.Services;
using Microsoft.Extensions.Azure;
using System.Text.RegularExpressions;

var envFilePath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envFilePath))
{
    DotNetEnv.Env.Load(envFilePath);
    Console.WriteLine($"File .env caricato da: {envFilePath}");
}

var builder = WebApplication.CreateBuilder(args);

//env resolver
builder.Configuration.AddPlaceholderResolver();

// Add services to the container.
#region builder.Configuration and builder.Services
builder.Configuration.AddEnvironmentVariables();

builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//file in Extensions
builder.Services.AddSwaggerExplorer()
				.InjectDbContext(builder.Configuration)
				.AddAppConfig(builder.Configuration)
				.AddIdentityHandlerAndStores()
				.ConfigureIdentityOptions()
				.AddIdentityAuth(builder.Configuration);

builder.Services.AddScoped<UserCocktailService>();
builder.Services.AddSingleton<BlobServiceClient>(x =>
    new BlobServiceClient(builder.Configuration.GetConnectionString("BlobAzuriteConnectionString")));
builder.Services.AddScoped<IAzureStorageService, AzureStorageService>();


var app = builder.Build();
#endregion

#region middelewares
app.ConfigureSwaggerExplorer();

app.ConfigureCORS(builder.Configuration);
app.UseHttpsRedirection();

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapStaticAssets();

app.AddIdentityAuthMiddlewares();
#endregion

#region api
app.MapControllers();

app.MapGroup("/api")
	.MapIdentityApi<IdentityUserExtended>();

app.MapGroup("/api")
	.MapIdentityUserEndpoints() //do not pass builder.Configuration for security reasons
    .MapAccountEndpoints()
    .MapUserCocktailEndpoints()
	.MapAuthorizationEndpoints()
	.MapSearchEndpoints()
	.MapTablesEndpoints()
	.MapSuggestedEndpoints();

#endregion

#region seeders
try
{
    await WaitForDbAsync(app.Services);

    using (var scope = app.Services.CreateScope())
    {
        var userContext = scope.ServiceProvider.GetRequiredService<IdentityUserContext>();
        var cocktailsContext = scope.ServiceProvider.GetRequiredService<CocktailsDbContext>();

        userContext.Database.Migrate();

        cocktailsContext.Database.Migrate();

        if (!cocktailsContext.Cocktails.Any())
            CocktailSeeder.Seed(cocktailsContext);
    }

    await RoleSeeder.SeedRoles(app.Services);
    await RoleSeeder.SeedAdminUser(app.Services);
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "Si è verificato un errore durante la migrazione o il seeding del database");
}
#endregion

// Angular

app.MapFallbackToFile("/index.csr.html");


var webRootPath = app.Environment.WebRootPath;
if (string.IsNullOrEmpty(webRootPath))
{
    webRootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
    Directory.CreateDirectory(webRootPath);
    app.Environment.WebRootPath = webRootPath;
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("WebRootPath set to: {WebRootPath}", webRootPath);
}

// Log existing files in wwwroot
var files = Directory.Exists(webRootPath) ? Directory.GetFiles(webRootPath, "*.*", SearchOption.AllDirectories) : new string[0];
var logger2 = app.Services.GetRequiredService<ILogger<Program>>();
logger2.LogInformation("Files in wwwroot: {FileCount}", files.Length);
foreach (var file in files.Take(10))
{
    logger2.LogInformation("File: {File}", Path.GetRelativePath(webRootPath, file));
}


app.Run();


async Task WaitForDbAsync(IServiceProvider services, int retryCount = 10, int retrySleepMilliseconds = 1000)
{
    var maxRetryCount = retryCount;
    var retryAttempt = 0;
    var retryDelay = TimeSpan.FromMilliseconds(retrySleepMilliseconds);

    using var scope = services.CreateScope();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    logger.LogInformation("Connessione alle stringhe: {connections}",
        new Dictionary<string, string> {
        { "DevDB", scope.ServiceProvider.GetRequiredService<IConfiguration>().GetConnectionString("DevDB") ?? "null" },
        { "Blob", scope.ServiceProvider.GetRequiredService<IConfiguration>().GetConnectionString("BlobAzuriteConnectionString") ?? "null" }
    });


    var userContext = scope.ServiceProvider.GetRequiredService<IdentityUserContext>();
    var cocktailsContext = scope.ServiceProvider.GetRequiredService<CocktailsDbContext>();

    while (retryAttempt < maxRetryCount)
    {
        try
        {
            logger.LogInformation("Tentativo di connessione al database (tentativo {Attempt}/{MaxAttempts})...",
                retryAttempt + 1, maxRetryCount);

            // Test the connection
            await userContext.Database.CanConnectAsync();
            await cocktailsContext.Database.CanConnectAsync();

            logger.LogInformation("Connessione al database stabilita con successo");
            break;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Impossibile connettersi al database. Nuovo tentativo tra {Delay} ms",
                retryDelay.TotalMilliseconds);

            retryAttempt++;
            if (retryAttempt >= maxRetryCount)
            {
                logger.LogError("Tentativi di connessione al database esauriti");
                throw;
            }

            await Task.Delay(retryDelay);
            retryDelay = TimeSpan.FromMilliseconds(retryDelay.TotalMilliseconds * 1.5);
        }
    }
}

public static class ConfigurationExtensions
{
    public static IConfigurationBuilder AddPlaceholderResolver(this IConfigurationBuilder builder)
    {
        var configuration = builder.Build();
        foreach (var kvp in configuration.AsEnumerable())
        {
            if (!string.IsNullOrEmpty(kvp.Value) && kvp.Value.Contains("${"))
            {
                var value = ResolvePlaceholders(kvp.Value);
                Environment.SetEnvironmentVariable(kvp.Key.Replace(":", "__"), value);
            }
        }

        builder.AddEnvironmentVariables();
        return builder;
    }

    private static string ResolvePlaceholders(string value)
    {
        var result = value;
        const string pattern = @"\$\{([^}]+)\}";
        var regex = new Regex(pattern);

        foreach (Match match in regex.Matches(value))
        {
            var varName = match.Groups[1].Value;
            var envValue = Environment.GetEnvironmentVariable(varName);

            if (!string.IsNullOrEmpty(envValue))
            {
                result = result.Replace($"${{{varName}}}", envValue);
            }
        }

        return result;
    }
}

