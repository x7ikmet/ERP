using ERP.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Api.Database.Configurations;

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        // builder.ToTable("products", t =>
        // {
        //     t.HasCheckConstraint("CK_products_unit_price", "unit_price >= 0");
        //     t.HasCheckConstraint("CK_products_cost_price", "cost_price >= 0");
        //     t.HasCheckConstraint("CK_products_stock_qty", "stock_qty >= 0");
        // });

        // Primary Key
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        // SKU - Optional, Unique
        builder.Property(p => p.Sku)
            .HasColumnName("sku")
            .HasMaxLength(100)
            .IsRequired(false);
        
        builder.HasIndex(p => p.Sku)
            .IsUnique()
            .HasFilter("sku IS NOT NULL");

        // Name - Required
        builder.Property(p => p.Name)
            .HasColumnName("name")
            .HasMaxLength(255)
            .IsRequired();

        // Slug - Required, Unique
        builder.Property(p => p.Slug)
            .HasColumnName("slug")
            .HasMaxLength(255)
            .IsRequired();
        
        builder.HasIndex(p => p.Slug)
            .IsUnique();

        // Foreign Key - Category
        builder.Property(p => p.CategoryId)
            .HasColumnName("category_id")
            .IsRequired();

        // Prices with precision
        builder.Property(p => p.UnitPrice)
            .HasColumnName("unit_price")
            .HasColumnType("numeric(12,2)")
            .IsRequired();

        builder.Property(p => p.CostPrice)
            .HasColumnName("cost_price")
            .HasColumnType("numeric(12,2)")
            .HasDefaultValue(0)
            .IsRequired();

        // Stock Quantity
        builder.Property(p => p.StockQty)
            .HasColumnName("stock_qty")
            .HasDefaultValue(0)
            .IsRequired();

        // Barcode - Optional
        builder.Property(p => p.Barcode)
            .HasColumnName("barcode")
            .HasMaxLength(100)
            .IsRequired(false);

        // Active Status
        builder.Property(p => p.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true)
            .IsRequired();

        // Audit Fields
        builder.Property(p => p.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("now()")
            .IsRequired();

        builder.Property(p => p.UpdatedAt)
            .HasColumnName("updated_at")
            .HasDefaultValueSql("now()")
            .IsRequired();

        // Relationship: Product Many → One Category
        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();
    }
}
