namespace ERP.Api.DTOs.Statistics;

public sealed class CustomerStatisticsDto
{
    public int TotalCustomers { get; init; }
    public int ActiveCustomers { get; init; }
    public int InactiveCustomers { get; init; }
    public int CustomersWithSales { get; init; }
    public DateTime? LastCustomerAdded { get; init; }
}