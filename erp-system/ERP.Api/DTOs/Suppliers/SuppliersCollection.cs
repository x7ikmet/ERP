namespace ERP.Api.DTOs.Suppliers;

public sealed record SuppliersCollection
{
    public List<SupplierDto> Items { get; init; } = [];
    public int TotalCount => Items.Count;
}
