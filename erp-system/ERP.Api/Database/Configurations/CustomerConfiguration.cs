using ERP.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Api.Database.Configurations;

public sealed class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("customers");

        // Primary Key
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        // UserId - Foreign Key to User
        builder.Property(c => c.UserId)
            .HasColumnName("user_id")
            .HasMaxLength(500)
            .IsRequired();

        // Name - Required
        builder.Property(c => c.Name)
            .HasColumnName("name")
            .HasMaxLength(255)
            .IsRequired();

        builder.HasIndex(c => new { c.UserId, c.Name }).IsUnique();

        // Email - Required, Unique per user
        builder.Property(c => c.Email)
            .HasColumnName("email")
            .HasMaxLength(255)
            .IsRequired();

        builder.HasIndex(c => new { c.UserId, c.Email }).IsUnique();

        // Phone - Required, Unique per user
        builder.Property(c => c.Phone)
            .HasColumnName("phone")
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(c => new { c.UserId, c.Phone }).IsUnique();

        // Address - Optional
        builder.Property(c => c.Address)
            .HasColumnName("address")
            .HasMaxLength(500)
            .IsRequired(false);

        // Contact Person - Optional
        builder.Property(c => c.ContactPerson)
            .HasColumnName("contact_person")
            .HasMaxLength(255)
            .IsRequired(false);

        // IsActive - Required, Default true
        builder.Property(c => c.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true)
            .IsRequired();

        // CreatedAt - Required
        builder.Property(c => c.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .IsRequired();

        // UpdatedAt - Optional
        builder.Property(c => c.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired(false);

        // Relationship with User
        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Note: Relationship with Sales will be added when Sale entity is implemented
        // builder.HasMany(c => c.Sales)
        //     .WithOne(s => s.Customer)
        //     .HasForeignKey(s => s.CustomerId)
        //     .OnDelete(DeleteBehavior.Restrict);
    }
}
