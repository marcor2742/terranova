using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace terranova.Server.Migrations.IdentityUser
{
    /// <inheritdoc />
    public partial class showmycocktails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ShowMyCocktails",
                table: "AspNetUsers",
                type: "bit",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShowMyCocktails",
                table: "AspNetUsers");
        }
    }
}
