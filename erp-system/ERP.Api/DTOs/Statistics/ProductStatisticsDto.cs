namespace ERP.Api.DTOs.Statistics;

public sealed class ProductStatisticsDto
{
    public int TotalProducts { get; init; }
    public int ActiveProducts { get; init; }
    public int LowStockProducts { get; init; }
    public int OutOfStockProducts { get; init; }
    public decimal TotalInventoryValue { get; init; }
}