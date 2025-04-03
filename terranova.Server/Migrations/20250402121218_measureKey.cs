using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace terranova.Server.Migrations
{
    /// <inheritdoc />
    public partial class measureKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_CocktailsIngredients",
                table: "CocktailsIngredients");

            migrationBuilder.DropColumn(
                name: "MeasureIM",
                table: "CocktailsIngredients");

            migrationBuilder.DropColumn(
                name: "MeasureMT",
                table: "CocktailsIngredients");

            migrationBuilder.AddColumn<long>(
                name: "MeasureKey",
                table: "CocktailsIngredients",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddPrimaryKey(
                name: "PK_CocktailsIngredients",
                table: "CocktailsIngredients",
                columns: new[] { "CocktailKey", "IngredientsKey", "MeasureKey" });

            migrationBuilder.CreateTable(
                name: "Measures",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Imperial = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Metric = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Measures", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CocktailsIngredients_MeasureKey",
                table: "CocktailsIngredients",
                column: "MeasureKey");

            migrationBuilder.AddForeignKey(
                name: "FK_CocktailsIngredients_Measures_MeasureKey",
                table: "CocktailsIngredients",
                column: "MeasureKey",
                principalTable: "Measures",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CocktailsIngredients_Measures_MeasureKey",
                table: "CocktailsIngredients");

            migrationBuilder.DropTable(
                name: "Measures");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CocktailsIngredients",
                table: "CocktailsIngredients");

            migrationBuilder.DropIndex(
                name: "IX_CocktailsIngredients_MeasureKey",
                table: "CocktailsIngredients");

            migrationBuilder.DropColumn(
                name: "MeasureKey",
                table: "CocktailsIngredients");

            migrationBuilder.AddColumn<string>(
                name: "MeasureIM",
                table: "CocktailsIngredients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MeasureMT",
                table: "CocktailsIngredients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_CocktailsIngredients",
                table: "CocktailsIngredients",
                columns: new[] { "CocktailKey", "IngredientsKey" });
        }
    }
}
