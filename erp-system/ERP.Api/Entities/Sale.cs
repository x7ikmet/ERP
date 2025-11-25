namespace ERP.Api.Entities;

public sealed class Sale
{
    public long Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public long? CustomerId { get; set; }
    public string SaleNo { get; set; } = string.Empty;
    public string Status { get; set; } = "draft"; // draft, completed, canceled
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation Properties
    public Customer? Customer { get; set; }
    public ICollection<SaleItem> SaleItems { get; set; } = [];
}
