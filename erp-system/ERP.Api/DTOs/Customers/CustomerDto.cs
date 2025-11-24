namespace ERP.Api.DTOs.Customers;

public sealed record CustomerDto
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
    // Note: SaleCount will be added when Sale entity is implemented
    // public int SaleCount { get; init; }
}
