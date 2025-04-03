using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace terranova.Server.Migrations
{
    /// <inheritdoc />
    public partial class cocktailsadbadjustments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cocktails_Glasses_GlassId",
                table: "Cocktails");

            migrationBuilder.DropForeignKey(
                name: "FK_Cocktails_IdentityUser_Creator",
                table: "Cocktails");

            migrationBuilder.DropForeignKey(
                name: "FK_Cocktails_Instructions_InstructionsId",
                table: "Cocktails");

            migrationBuilder.DropIndex(
                name: "IX_Cocktails_GlassId",
                table: "Cocktails");

            migrationBuilder.DropIndex(
                name: "IX_Cocktails_InstructionsId",
                table: "Cocktails");

            migrationBuilder.DropColumn(
                name: "GlassId",
                table: "Cocktails");

            migrationBuilder.DropColumn(
                name: "InstructionsId",
                table: "Cocktails");

            migrationBuilder.CreateIndex(
                name: "IX_Cocktails_GlassKey",
                table: "Cocktails",
                column: "GlassKey");

            migrationBuilder.CreateIndex(
                name: "IX_Cocktails_InstructionsKey",
                table: "Cocktails",
                column: "InstructionsKey");

            migrationBuilder.AddForeignKey(
                name: "FK_Cocktails_AspNetUsers_Creator",
                table: "Cocktails",
                column: "Creator",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Cocktails_Glasses_GlassKey",
                table: "Cocktails",
                column: "GlassKey",
                principalTable: "Glasses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Cocktails_Instructions_InstructionsKey",
                table: "Cocktails",
                column: "InstructionsKey",
                principalTable: "Instructions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cocktails_AspNetUsers_Creator",
                table: "Cocktails");

            migrationBuilder.DropForeignKey(
                name: "FK_Cocktails_Glasses_GlassKey",
                table: "Cocktails");

            migrationBuilder.DropForeignKey(
                name: "FK_Cocktails_Instructions_InstructionsKey",
                table: "Cocktails");

            migrationBuilder.DropIndex(
                name: "IX_Cocktails_GlassKey",
                table: "Cocktails");

            migrationBuilder.DropIndex(
                name: "IX_Cocktails_InstructionsKey",
                table: "Cocktails");

            migrationBuilder.AddColumn<long>(
                name: "GlassId",
                table: "Cocktails",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "InstructionsId",
                table: "Cocktails",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cocktails_GlassId",
                table: "Cocktails",
                column: "GlassId");

            migrationBuilder.CreateIndex(
                name: "IX_Cocktails_InstructionsId",
                table: "Cocktails",
                column: "InstructionsId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cocktails_Glasses_GlassId",
                table: "Cocktails",
                column: "GlassId",
                principalTable: "Glasses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Cocktails_IdentityUser_Creator",
                table: "Cocktails",
                column: "Creator",
                principalTable: "IdentityUser",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Cocktails_Instructions_InstructionsId",
                table: "Cocktails",
                column: "InstructionsId",
                principalTable: "Instructions",
                principalColumn: "Id");
        }
    }
}
