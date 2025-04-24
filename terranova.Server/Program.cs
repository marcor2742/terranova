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
using System;
using System.IO;
using terranova.Server.Controllers;
using terranova.Server.Data;
using terranova.Server.Extensions;
using terranova.Server.Models;
using terranova.Server.Seeder;
using terranova.Server.Services;
using Microsoft.Extensions.Azure;

var builder = WebApplication.CreateBuilder(args);

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
using (var scope = app.Services.CreateScope())
{
	var userContext = scope.ServiceProvider.GetRequiredService<IdentityUserContext>();
	userContext.Database.Migrate();

	var cocktailsContext = scope.ServiceProvider.GetRequiredService<CocktailsDbContext>();
	cocktailsContext.Database.Migrate();


	if (!cocktailsContext.Cocktails.Any())
		CocktailSeeder.Seed(cocktailsContext);
}

await RoleSeeder.SeedRoles(app.Services);
await RoleSeeder.SeedAdminUser(app.Services);
#endregion

// Angular
app.UseDefaultFiles();
app.MapStaticAssets();
app.MapFallbackToFile("/index.html");

app.Run();