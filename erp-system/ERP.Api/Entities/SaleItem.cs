namespace ERP.Api.Entities;

public sealed class SaleItem
{
    public long Id { get; set; }
    public long SaleId { get; set; }
    public long ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; private set; }
    
    // Navigation Properties
    public Sale Sale { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
