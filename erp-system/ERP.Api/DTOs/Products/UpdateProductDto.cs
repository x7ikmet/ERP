namespace ERP.Api.DTOs.Products;

public sealed record UpdateProductDto
{
    public required string Name { get; init; }
    public string? Sku { get; init; }
    public required string Slug { get; init; }
    public required int CategoryId { get; init; }
    public required decimal UnitPrice { get; init; }
    public required decimal CostPrice { get; init; }
    public required int StockQty { get; init; }
    public string? Barcode { get; init; }
    public required bool IsActive { get; init; }

}
