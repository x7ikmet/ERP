namespace ERP.Api.DTOs.Purchases;

public sealed record PurchaseItemDto
{
    public long Id { get; init; }
    public long ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string ProductSku { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal UnitCost { get; init; }
    public decimal LineTotal { get; init; }
}