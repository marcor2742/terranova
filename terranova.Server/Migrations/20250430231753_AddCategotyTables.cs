using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace terranova.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddCategotyTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Cocktails");

            migrationBuilder.AddColumn<long>(
                name: "CategoryKey",
                table: "Cocktails",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cocktails_CategoryKey",
                table: "Cocktails",
                column: "CategoryKey");

            migrationBuilder.AddForeignKey(
                name: "FK_Cocktails_Categories_CategoryKey",
                table: "Cocktails",
                column: "CategoryKey",
                principalTable: "Categories",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cocktails_Categories_CategoryKey",
                table: "Cocktails");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Cocktails_CategoryKey",
                table: "Cocktails");

            migrationBuilder.DropColumn(
                name: "CategoryKey",
                table: "Cocktails");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Cocktails",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
