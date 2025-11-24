namespace ERP.Api.Entities;

public sealed class Category
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Navigation Property (One-to-Many)
    public ICollection<Product> Products { get; set; } = [];
}
