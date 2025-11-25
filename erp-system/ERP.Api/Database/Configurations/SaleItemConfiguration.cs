using ERP.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Api.Database.Configurations;

public sealed class SaleItemConfiguration : IEntityTypeConfiguration<SaleItem>
{
    public void Configure(EntityTypeBuilder<SaleItem> builder)
    {
        builder.ToTable("sale_items");

        // Primary Key
        builder.HasKey(si => si.Id);
        builder.Property(si => si.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        // Foreign Keys
        builder.Property(si => si.SaleId)
            .HasColumnName("sale_id")
            .IsRequired();

        builder.Property(si => si.ProductId)
            .HasColumnName("product_id")
            .IsRequired();

        // Quantity
        builder.Property(si => si.Quantity)
            .HasColumnName("quantity")
            .IsRequired();

        // UnitPrice
        builder.Property(si => si.UnitPrice)
            .HasColumnName("unit_price")
            .HasColumnType("numeric(12,2)")
            .IsRequired();

        // LineTotal (computed property)
        builder.Property(si => si.LineTotal)
            .HasColumnName("line_total")
            .HasColumnType("numeric(14,2)")
            .HasComputedColumnSql("quantity * unit_price", stored: true);

        // Relationships
        builder.HasOne(si => si.Sale)
            .WithMany(s => s.SaleItems)
            .HasForeignKey(si => si.SaleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(si => si.Product)
            .WithMany()
            .HasForeignKey(si => si.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
