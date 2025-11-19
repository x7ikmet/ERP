using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ERP.Api.Migrations.Application;

/// <inheritdoc />
public partial class Add_Products : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.EnsureSchema(
            name: "erp_system");

        migrationBuilder.CreateTable(
            name: "products",
            schema: "erp_system",
            columns: table => new
            {
                id = table.Column<long>(type: "bigint", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                sku = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                slug = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                category_id = table.Column<int>(type: "integer", nullable: false),
                unit_price = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                cost_price = table.Column<decimal>(type: "numeric(12,2)", nullable: false, defaultValue: 0m),
                stock_qty = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                barcode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_products", x => x.id);
            });

        migrationBuilder.CreateIndex(
            name: "ix_products_sku",
            schema: "erp_system",
            table: "products",
            column: "sku",
            unique: true,
            filter: "sku IS NOT NULL");

        migrationBuilder.CreateIndex(
            name: "ix_products_slug",
            schema: "erp_system",
            table: "products",
            column: "slug",
            unique: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "products",
            schema: "erp_system");
    }
}
