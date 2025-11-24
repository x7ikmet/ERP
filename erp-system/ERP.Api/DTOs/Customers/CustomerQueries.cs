using System.Linq.Expressions;
using ERP.Api.Entities;

namespace ERP.Api.DTOs.Customers;

internal static class CustomerQueries
{
    public static Expression<Func<Customer, CustomerDto>> ProjectToDto()
    {
        return c => new CustomerDto
        {
            Id = c.Id,
            Name = c.Name,
            Email = c.Email,
            Phone = c.Phone,
            Address = c.Address,
            ContactPerson = c.ContactPerson,
            IsActive = c.IsActive,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt
            // Note: SaleCount will be added when Sale entity is implemented
            // SaleCount = c.Sales.Count
        };
    }
}
