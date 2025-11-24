using ERP.Api.Entities;

namespace ERP.Api.DTOs.Customers;

internal static class CustomerMapping
{
    public static CustomerDto ToDto(this Customer customer)
    {
        return new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Email = customer.Email,
            Phone = customer.Phone,
            Address = customer.Address,
            ContactPerson = customer.ContactPerson,
            IsActive = customer.IsActive,
            CreatedAt = customer.CreatedAt,
            UpdatedAt = customer.UpdatedAt
            // Note: SaleCount will be added when Sale entity is implemented
            // SaleCount = customer.Sales?.Count ?? 0
        };
    }

    public static Customer ToEntity(this CreateCustomerDto dto, string userId)
    {
        return new Customer
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

    public static void UpdateFromDto(this Customer customer, UpdateCustomerDto dto)
    {
        customer.Name = dto.Name;
        customer.Email = dto.Email;
        customer.Phone = dto.Phone;
        customer.Address = dto.Address;
        customer.ContactPerson = dto.ContactPerson;
        customer.IsActive = dto.IsActive;
        customer.UpdatedAt = DateTime.UtcNow;
    }
}
