using ERP.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Api.Database.Configurations;

public sealed class SaleConfiguration : IEntityTypeConfiguration<Sale>
{
    public void Configure(EntityTypeBuilder<Sale> builder)
    {
        builder.ToTable("sales");

        // Primary Key
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        // UserId - Foreign Key to User
        builder.Property(s => s.UserId)
            .HasColumnName("user_id")
            .HasMaxLength(500)
            .IsRequired();

        // CustomerId - Optional Foreign Key
        builder.Property(s => s.CustomerId)
            .HasColumnName("customer_id")
            .IsRequired(false);

        // SaleNo - Required, Unique per user
        builder.Property(s => s.SaleNo)
            .HasColumnName("sale_no")
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(s => new { s.UserId, s.SaleNo }).IsUnique();

        // Status
        builder.Property(s => s.Status)
            .HasColumnName("status")
            .HasMaxLength(30)
            .IsRequired()
            .HasDefaultValue("draft");

        // TotalAmount
        builder.Property(s => s.TotalAmount)
            .HasColumnName("total_amount")
            .HasColumnType("numeric(14,2)")
            .HasDefaultValue(0m);

        // Timestamps
        builder.Property(s => s.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(s => s.UpdatedAt)
            .HasColumnName("updated_at");

        // Relationships
        builder.HasOne(s => s.Customer)
            .WithMany(c => c.Sales)
            .HasForeignKey(s => s.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.SaleItems)
            .WithOne(si => si.Sale)
            .HasForeignKey(si => si.SaleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
