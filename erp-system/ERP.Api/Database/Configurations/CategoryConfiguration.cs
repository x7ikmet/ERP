using ERP.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Api.Database.Configurations;

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories");

        // Primary Key
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        // UserId
        builder.Property(p => p.UserId).HasMaxLength(500);

        // Name - Required
        builder.Property(c => c.Name)
            .HasColumnName("name")
            .HasMaxLength(150)
            .IsRequired();

        builder.HasIndex(c => new { c.UserId, c.Name }).IsUnique();

        // Slug - Required, Unique
        builder.Property(c => c.Slug)
            .HasColumnName("slug")
            .HasMaxLength(150)
            .IsRequired();
        
        builder.HasIndex(c => new { c.UserId, c.Slug } ).IsUnique();

        // Description - Optional
        builder.Property(c => c.Description)
            .HasColumnName("description")
            .HasColumnType("text")
            .IsRequired(false);

        // Relationship: Category 1 → Many Products
        builder.HasMany(c => c.Products)
            .WithOne(p => p.Category)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(c => c.UserId);
    }
}
