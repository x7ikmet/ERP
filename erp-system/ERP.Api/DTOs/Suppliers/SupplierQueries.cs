using System.Linq.Expressions;
using ERP.Api.Entities;

namespace ERP.Api.DTOs.Suppliers;

internal static class SupplierQueries
{
    public static Expression<Func<Supplier, SupplierDto>> ProjectToDto()
    {
        return s => new SupplierDto
        {
            Id = s.Id,
            Name = s.Name,
            Email = s.Email,
            Phone = s.Phone,
            Address = s.Address,
            ContactPerson = s.ContactPerson,
            IsActive = s.IsActive,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt
            // Note: PurchaseCount will be added when Purchase entity is implemented
            // PurchaseCount = s.Purchases.Count
        };
    }
}
