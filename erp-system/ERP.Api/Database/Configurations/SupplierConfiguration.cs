using ERP.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Api.Database.Configurations;

public sealed class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.ToTable("suppliers");

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

        // Name - Required
        builder.Property(s => s.Name)
            .HasColumnName("name")
            .HasMaxLength(255)
            .IsRequired();

        builder.HasIndex(s => new { s.UserId, s.Name }).IsUnique();

        // Email - Required, Unique per user
        builder.Property(s => s.Email)
            .HasColumnName("email")
            .HasMaxLength(255)
            .IsRequired();

        builder.HasIndex(s => new { s.UserId, s.Email }).IsUnique();

        // Phone - Required, Unique per user
        builder.Property(s => s.Phone)
            .HasColumnName("phone")
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(s => new { s.UserId, s.Phone }).IsUnique();

        // Address - Optional
        builder.Property(s => s.Address)
            .HasColumnName("address")
            .HasMaxLength(500)
            .IsRequired(false);

        // Contact Person - Optional
        builder.Property(s => s.ContactPerson)
            .HasColumnName("contact_person")
            .HasMaxLength(255)
            .IsRequired(false);

        // IsActive - Required, Default true
        builder.Property(s => s.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true)
            .IsRequired();

        // CreatedAt - Required
        builder.Property(s => s.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .IsRequired();

        // UpdatedAt - Optional
        builder.Property(s => s.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired(false);

        // Relationship with User
        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Note: Relationship with Purchases will be added when Purchase entity is implemented
        // builder.HasMany(s => s.Purchases)
        //     .WithOne(p => p.Supplier)
        //     .HasForeignKey(p => p.SupplierId)
        //     .OnDelete(DeleteBehavior.Restrict);
    }
}
