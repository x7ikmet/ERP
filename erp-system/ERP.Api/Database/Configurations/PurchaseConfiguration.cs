using ERP.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Api.Database.Configurations;

public sealed class PurchaseConfiguration : IEntityTypeConfiguration<Purchase>
{
    public void Configure(EntityTypeBuilder<Purchase> builder)
    {
        builder.ToTable("purchases");

        // Primary Key
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        // UserId - Foreign Key to User
        builder.Property(p => p.UserId)
            .HasColumnName("user_id")
            .HasMaxLength(500)
            .IsRequired();

        // SupplierId - Optional Foreign Key
        builder.Property(p => p.SupplierId)
            .HasColumnName("supplier_id")
            .IsRequired(false);

        // PurchaseNo - Required, Unique per user
        builder.Property(p => p.PurchaseNo)
            .HasColumnName("purchase_no")
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(p => new { p.UserId, p.PurchaseNo }).IsUnique();

        // Status
        builder.Property(p => p.Status)
            .HasColumnName("status")
            .HasMaxLength(30)
            .IsRequired()
            .HasDefaultValue("draft");

        // TotalAmount
        builder.Property(p => p.TotalAmount)
            .HasColumnName("total_amount")
            .HasColumnType("numeric(14,2)")
            .HasDefaultValue(0m);

        // Timestamps
        builder.Property(p => p.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(p => p.UpdatedAt)
            .HasColumnName("updated_at");

        // Relationships
        builder.HasOne(p => p.Supplier)
            .WithMany(s => s.Purchases)
            .HasForeignKey(p => p.SupplierId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.PurchaseItems)
            .WithOne(pi => pi.Purchase)
            .HasForeignKey(pi => pi.PurchaseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}