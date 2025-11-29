namespace ERP.Api.Entities;

public sealed class PurchaseItem
{
    public long Id { get; set; }
    public long PurchaseId { get; set; }
    public long ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal LineTotal { get; private set; }
    
    // Navigation Properties
    public Purchase Purchase { get; set; } = null!;
    public Product Product { get; set; } = null!;
}