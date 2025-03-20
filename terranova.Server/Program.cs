using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using terranova.Server.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Configuration.AddEnvironmentVariables();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Services from Identity Core
builder.Services
    .AddIdentityApiEndpoints<IdentityUserExtended>(options => {
        //options.IdentityApiEndpointRoutes.DisableAccountEndpoint("register"); //overwrite /register (doesn't work)

        //options.User.RequireUniqueEmail = true; // moved
    })
    .AddEntityFrameworkStores<IdentityUserContext>();

builder.Services.Configure<IdentityOptions>(options =>
    {
        options.User.RequireUniqueEmail = true; //for some reason email is not unique by default
        options.Password.RequireDigit = false; //docs.md line 14 for documentation
        options.Password.RequireUppercase = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireNonAlphanumeric = false;
        //options.RequiewsUniqueChars = 2; //default is 1 (disabled), with 2 it requires 2 different characters
    });

var connString = builder.Configuration.GetConnectionString("DevDB");
if (connString != null)
{
    var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "default_password";
    connString = connString.Replace("#{DB_PASSWORD}", dbPassword);
}

builder.Services.AddDbContext<IdentityUserContext>(options =>
    options.UseSqlServer(connString));

builder.Services.AddAuthentication();



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

#region Config. CORS
app.UseCors(options =>
{
    options.WithOrigins("http://localhost:56057");
    // options.AllowAnyOrigin();
    options.AllowAnyHeader();
    options.AllowAnyMethod();
});
#endregion

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

    //return Results.BadRequest(new { errors = result.Errors });
    return Results.BadRequest(result);
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
