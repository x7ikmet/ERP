namespace ERP.Api.Entities;

public sealed class Purchase
{
    public long Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public long? SupplierId { get; set; }
    public string PurchaseNo { get; set; } = string.Empty;
    public string Status { get; set; } = "draft"; // draft, completed, canceled
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation Properties
    public Supplier? Supplier { get; set; }
    public ICollection<PurchaseItem> PurchaseItems { get; set; } = [];
}