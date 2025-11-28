namespace ERP.Api.DTOs.Statistics;

public sealed class SalesStatisticsDto
{
    public decimal TotalSales { get; init; }
    public int CompletedSalesCount { get; init; }
    public int PendingSalesCount { get; init; }
    public int CancelledSalesCount { get; init; }
    public decimal AverageSaleAmount { get; init; }
    public DateTime? LastSaleDate { get; init; }
}