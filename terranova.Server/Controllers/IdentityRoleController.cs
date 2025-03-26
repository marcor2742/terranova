//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Identity;
//using Microsoft.AspNetCore.Mvc;
//using terranova.Server.Models;

//namespace terranova.Server.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class IdentityRoleController : ControllerBase
//    {
//        private readonly RoleManager<IdentityRole> _roleManager;
//        private readonly UserManager<IdentityUserExtended> _userManager;

//        public IdentityRoleController(RoleManager<IdentityRole> roleManager, UserManager<IdentityUserExtended> userManager)
//        {
//            _roleManager = roleManager;
//            _userManager = userManager;
//        }

//        [HttpPost("CreateRole")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> CreateRole(string roleName)
//        {
//            if (string.IsNullOrWhiteSpace(roleName))
//            {
//                return BadRequest("Role name cannot be empty.");
//            }

//            var roleExists = await _roleManager.RoleExistsAsync(roleName);
//            if (roleExists)
//            {
//                return BadRequest("Role already exists.");
//            }

//            var result = await _roleManager.CreateAsync(new IdentityRole(roleName));
//            if (result.Succeeded)
//            {
//                return Ok("Role created successfully.");
//            }

//            return BadRequest(result.Errors);
//        }

//        [HttpPost("AssignRole")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> AssignRole(string userId, string roleName)
//        {
//            var user = await _userManager.FindByIdAsync(userId);
//            if (user == null)
//            {
//                return NotFound("User not found.");
//            }

//            var roleExists = await _roleManager.RoleExistsAsync(roleName);
//            if (!roleExists)
//            {
//                return BadRequest("Role does not exist.");
//            }

//            var result = await _userManager.AddToRoleAsync(user, roleName);
//            if (result.Succeeded)
//            {
//                return Ok("Role assigned successfully.");
//            }

//            return BadRequest(result.Errors);
//        }

//        [HttpPost("RemoveRole")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> RemoveRole(string userId, string roleName)
//        {
//            var user = await _userManager.FindByIdAsync(userId);
//            if (user == null)
//            {
//                return NotFound("User not found.");
//            }

//            var result = await _userManager.RemoveFromRoleAsync(user, roleName);
//            if (result.Succeeded)
//            {
//                return Ok("Role removed successfully.");
//            }

//            return BadRequest(result.Errors);
//        }

//        [HttpGet("GetUserRoles")]
//        [Authorize]
//        public async Task<IActionResult> GetUserRoles(string userId)
//        {
//            var user = await _userManager.FindByIdAsync(userId);
//            if (user == null)
//            {
//                return NotFound("User not found.");
//            }

//            var roles = await _userManager.GetRolesAsync(user);
//            return Ok(roles);
//        }
//    }
//}



//using terranova.Server.Models;

//file endpoint
//public static class RolesEndpoints
//{
//    public static IEndpointRouteBuilder MapRolesEndpoints(this IEndpointRouteBuilder app)
//    {
//        app.MapControllers(); // Assicurati che i controller siano mappati

//        return app;
//    }
//}


//file program.cs
//app.MapGroup("/api")
//    .MapIdentityApi<IdentityUserExtended>();

//app.MapGroup("/api")
//    .MapIdentityUserEndpoints() //do not pass builder.Configuration for security reasons
//    .MapAccountEndpoints()
//    .MapRolesEndpoints(); // Aggiungi questo