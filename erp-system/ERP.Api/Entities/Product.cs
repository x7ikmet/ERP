namespace ERP.Api.Entities;

public sealed class Product
{
    public long Id { get; set; }
    public string? Sku { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal CostPrice { get; set; }
    public int StockQty { get; set; }
    public string? Barcode { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation Property (Many-to-One)
    public Category Category { get; set; } = null!;
}
