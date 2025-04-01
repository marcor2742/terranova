using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using terranova.Server.Controllers;
using terranova.Server.Data;
using terranova.Server.Extensions;
using terranova.Server.Models;

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
    .MapAuthorizationEndpoints();

#endregion

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CocktailsDbContext>();
    CocktailSeeder.Seed(context);  // Usa il metodo Seed che hai già definito
}

// Angular
app.UseDefaultFiles();
app.MapStaticAssets();
app.MapFallbackToFile("/index.html");

app.Run();