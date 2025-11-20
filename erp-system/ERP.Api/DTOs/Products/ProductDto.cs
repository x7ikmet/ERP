namespace ERP.Api.DTOs.Products;

public sealed record ProductsCollection{
    public List<ProductDto> Data { get; init; }
}

public sealed record ProductDto
{
    public long Id { get; init; }
    public string? Sku { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public int CategoryId { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal CostPrice { get; init; }
    public int StockQty { get; init; }
    public string? Barcode { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
