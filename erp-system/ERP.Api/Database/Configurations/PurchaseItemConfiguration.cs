using ERP.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Api.Database.Configurations;

public sealed class PurchaseItemConfiguration : IEntityTypeConfiguration<PurchaseItem>
{
    public void Configure(EntityTypeBuilder<PurchaseItem> builder)
    {
        builder.ToTable("purchase_items");

        // Primary Key
        builder.HasKey(pi => pi.Id);
        builder.Property(pi => pi.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        // Foreign Keys
        builder.Property(pi => pi.PurchaseId)
            .HasColumnName("purchase_id")
            .IsRequired();

        builder.Property(pi => pi.ProductId)
            .HasColumnName("product_id")
            .IsRequired();

        // Quantity
        builder.Property(pi => pi.Quantity)
            .HasColumnName("quantity")
            .IsRequired();

        // UnitCost
        builder.Property(pi => pi.UnitCost)
            .HasColumnName("unit_cost")
            .HasColumnType("numeric(12,2)")
            .IsRequired();

        // LineTotal (computed property)
        builder.Property(pi => pi.LineTotal)
            .HasColumnName("line_total")
            .HasColumnType("numeric(14,2)")
            .HasComputedColumnSql("quantity * unit_cost", stored: true);

        // Relationships
        builder.HasOne(pi => pi.Purchase)
            .WithMany(p => p.PurchaseItems)
            .HasForeignKey(pi => pi.PurchaseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pi => pi.Product)
            .WithMany()
            .HasForeignKey(pi => pi.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}