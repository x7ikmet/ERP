using ERP.Api.Entities;

namespace ERP.Api.DTOs.Suppliers;

internal static class SupplierMapping
{
    public static SupplierDto ToDto(this Supplier supplier)
    {
        return new SupplierDto
        {
            Id = supplier.Id,
            Name = supplier.Name,
            Email = supplier.Email,
            Phone = supplier.Phone,
            Address = supplier.Address,
            ContactPerson = supplier.ContactPerson,
            IsActive = supplier.IsActive,
            CreatedAt = supplier.CreatedAt,
            UpdatedAt = supplier.UpdatedAt
            // Note: PurchaseCount will be added when Purchase entity is implemented
            // PurchaseCount = supplier.Purchases?.Count ?? 0
        };
    }

    public static Supplier ToEntity(this CreateSupplierDto dto, string userId)
    {
        return new Supplier
        {
            UserId = userId,
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            ContactPerson = dto.ContactPerson,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };
    }

    public static void UpdateFromDto(this Supplier supplier, UpdateSupplierDto dto)
    {
        supplier.Name = dto.Name;
        supplier.Email = dto.Email;
        supplier.Phone = dto.Phone;
        supplier.Address = dto.Address;
        supplier.ContactPerson = dto.ContactPerson;
        supplier.IsActive = dto.IsActive;
        supplier.UpdatedAt = DateTime.UtcNow;
    }
}
