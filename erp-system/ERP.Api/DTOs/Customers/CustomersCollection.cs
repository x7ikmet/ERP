namespace ERP.Api.DTOs.Customers;

public sealed record CustomersCollection
{
    public List<CustomerDto> Items { get; init; } = [];
    public int TotalCount => Items.Count;
}
