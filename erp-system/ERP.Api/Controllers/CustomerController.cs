using ERP.Api.Database;
using ERP.Api.Entities;
using ERP.Api.DTOs.Customers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using ERP.Api.Services;
using FluentValidation;

namespace ERP.Api.Controllers;

[Authorize]
[ApiController]
[Route("customers")]
public sealed class CustomerController(
    ApplicationDbContext dbContext,
    UserContext userContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<CustomersCollection>> GetCustomers([FromQuery] bool? isActive = null)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var query = dbContext
            .Customers
            .Where(c => c.UserId == userId);

        // Filter by active status if specified
        if (isActive.HasValue)
        {
            query = query.Where(c => c.IsActive == isActive.Value);
        }

        List<CustomerDto> customers = await query
            .OrderBy(c => c.Name)
            .Select(CustomerQueries.ProjectToDto())
            .ToListAsync();

        var customersCollection = new CustomersCollection
        {
            Items = customers
        };

        return Ok(customersCollection);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<CustomerDto>> GetCustomer(long id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var customer = await dbContext
            .Customers
            .Where(c => c.Id == id && c.UserId == userId)
            .Select(CustomerQueries.ProjectToDto())
            .FirstOrDefaultAsync();

        if (customer is null)
        {
            return NotFound();
        }

        return Ok(customer);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> CreateCustomer(CreateCustomerDto createCustomerDto, IValidator<CreateCustomerDto> validator)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        // Validate the DTO
        await validator.ValidateAndThrowAsync(createCustomerDto);

        var customer = createCustomerDto.ToEntity(userId);

        dbContext.Customers.Add(customer);
        await dbContext.SaveChangesAsync();

        var customerDto = customer.ToDto();

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customerDto);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> UpdateCustomer(long id, UpdateCustomerDto updateCustomerDto, IValidator<UpdateCustomerDto> validator)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        // Validate the DTO
        await validator.ValidateAndThrowAsync(updateCustomerDto);

        Customer? customer = await dbContext
            .Customers
            .Where(c => c.UserId == userId)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer is null)
        {
            return NotFound();
        }

        customer.UpdateFromDto(updateCustomerDto);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> DeleteCustomer(long id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        Customer? customer = await dbContext
            .Customers
            .Where(c => c.UserId == userId)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer is null)
        {
            return NotFound();
        }

        // Note: Check for sales relationship when Sale entity is implemented
        // bool hasSales = await dbContext
        //     .Sales
        //     .AnyAsync(s => s.CustomerId == id);

        // if (hasSales)
        // {
        //     return Conflict(new { message = "Cannot delete customer with existing sales" });
        // }

        dbContext.Customers.Remove(customer);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id:long}/toggle-status")]
    public async Task<ActionResult> ToggleCustomerStatus(long id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        Customer? customer = await dbContext
            .Customers
            .Where(c => c.UserId == userId)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer is null)
        {
            return NotFound();
        }

        customer.IsActive = !customer.IsActive;
        customer.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}
