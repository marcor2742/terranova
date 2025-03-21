using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using terranova.Server.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
#region builder.Configuration and builder.Services
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

builder.Services.AddAuthentication(x =>
    {
        x.DefaultAuthenticateScheme =
        x.DefaultChallengeScheme =
        x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    }).AddJwtBearer(y => 
    {
        y.SaveToken = false;
        y.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:JWT_Secret"]!)),
        };
    });

#endregion

var app = builder.Build();

#region middelewares
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

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();
#endregion

app
    .MapGroup("/api")
    .MapIdentityApi<IdentityUserExtended>();

#region api
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

app.MapPost("/api/loginextended", async (
    UserManager<IdentityUserExtended> userManager,
    [FromBody] UserLoginningModel model) =>
{
    var user = await userManager.FindByEmailAsync(model.Email);
    if (user != null && await userManager.CheckPasswordAsync(user, model.Password))
    {
        var signInKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:JWT_Secret"]!));
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
        return Results.Ok(new {token});
    }
    return Results.BadRequest(new { message = "Email o password errati" });
});


#endregion

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

public class UserLoginningModel
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
