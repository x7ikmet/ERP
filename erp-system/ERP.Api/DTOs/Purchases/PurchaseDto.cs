namespace ERP.Api.DTOs.Purchases;

public sealed record PurchaseDto
{
    public long Id { get; init; }
    public long? SupplierId { get; init; }
    public string? SupplierName { get; init; }
    public string PurchaseNo { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<PurchaseItemDto> Items { get; init; } = [];
}