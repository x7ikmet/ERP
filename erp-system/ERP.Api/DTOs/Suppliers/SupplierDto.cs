namespace ERP.Api.DTOs.Suppliers;

public sealed record SupplierDto
{
    public long Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Phone { get; init; } = string.Empty;
    public string? Address { get; init; }
    public string? ContactPerson { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    // Note: PurchaseCount will be added when Purchase entity is implemented
    // public int PurchaseCount { get; init; }
}
