using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ERP.Api.Migrations.Application;

/// <inheritdoc />
public partial class Add_Categories : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "categories",
            schema: "erp_system",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                slug = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                description = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_categories", x => x.id);
            });

        migrationBuilder.CreateIndex(
            name: "ix_products_category_id",
            schema: "erp_system",
            table: "products",
            column: "category_id");

        migrationBuilder.CreateIndex(
            name: "ix_categories_slug",
            schema: "erp_system",
            table: "categories",
            column: "slug",
            unique: true);

        migrationBuilder.AddForeignKey(
            name: "fk_products_categories_category_id",
            schema: "erp_system",
            table: "products",
            column: "category_id",
            principalSchema: "erp_system",
            principalTable: "categories",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "fk_products_categories_category_id",
            schema: "erp_system",
            table: "products");

        migrationBuilder.DropTable(
            name: "categories",
            schema: "erp_system");

        migrationBuilder.DropIndex(
            name: "ix_products_category_id",
            schema: "erp_system",
            table: "products");
    }
}
