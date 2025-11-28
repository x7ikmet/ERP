namespace ERP.Api.DTOs.Statistics;

public sealed class DashboardStatisticsDto
{
    public decimal TotalSales { get; init; }
    public int TotalProducts { get; init; }
    public int TotalCustomers { get; init; }
    public int ActiveCustomers { get; init; }
    public int CompletedSalesCount { get; init; }
    public int PendingSalesCount { get; init; }
}