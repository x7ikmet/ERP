namespace ERP.Api.DTOs.Sales;

public sealed record SaleDto
{
    public long Id { get; init; }
    public long? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string SaleNo { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<SaleItemDto> Items { get; init; } = [];
}
