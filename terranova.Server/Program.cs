using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using terranova.Server.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Services from Identity Core
builder.Services
    .AddIdentityApiEndpoints<IdentityUserExtended>(options => {
        //options.IdentityApiEndpointRoutes.DisableAccountEndpoint("register");

        options.User.RequireUniqueEmail = true; // Email deve essere unica
    })
    .AddEntityFrameworkStores<IdentityUserContext>();

builder.Services.AddDbContext<IdentityUserContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DevDB")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(options =>
{
    options.WithOrigins("http://localhost:56057");
    // options.AllowAnyOrigin();
    options.AllowAnyHeader();
    options.AllowAnyMethod();
});

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app
    .MapGroup("/api")
    .MapIdentityApi<IdentityUserExtended>();

//app.MapPost("/api/signup",(
//    UserManager<IdentityUserExtended> userManager,
//[FromBody] UserRegistrationModel UserRegistrationModel
//    ) =>
//{
//IdentityUserExtended user = new IdentityUserExtended
//{
//UserName = UserRegistrationModel.Email,
//Email = UserRegistrationModel.Email,
//FullName = UserRegistrationModel.FullName
//        };
//return "User signed up";
//    });



app.MapPost("/api/registerextended", async (
    UserManager<IdentityUserExtended> userManager,
    [FromBody] UserRegistrationModel model) =>
{

    var user = new IdentityUserExtended
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

    return Results.BadRequest(new { errors = result.Errors });
});

// Angular
app.UseDefaultFiles();
app.MapStaticAssets();
app.MapFallbackToFile("/index.html");

app.Run();





public class UserRegistrationModel
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    [Required(ErrorMessage = "Username is required")]
    public string Username { get; set; } = string.Empty;
    public string? FullName { get; set; } // opzionale
}
