using ERP.Api.Database;
using ERP.Api.Entities;
using ERP.Api.DTOs.Suppliers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using ERP.Api.Services;
using FluentValidation;

namespace ERP.Api.Controllers;

[Authorize]
[ApiController]
[Route("suppliers")]
public sealed class SupplierController(
    ApplicationDbContext dbContext,
    UserContext userContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<SuppliersCollection>> GetSuppliers([FromQuery] bool? isActive = null)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var query = dbContext
            .Suppliers
            .Where(s => s.UserId == userId);

        // Filter by active status if specified
        if (isActive.HasValue)
        {
            query = query.Where(s => s.IsActive == isActive.Value);
        }

        List<SupplierDto> suppliers = await query
            .OrderBy(s => s.Name)
            .Select(SupplierQueries.ProjectToDto())
            .ToListAsync();

        var suppliersCollection = new SuppliersCollection
        {
            Items = suppliers
        };

        return Ok(suppliersCollection);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<SupplierDto>> GetSupplier(long id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var supplier = await dbContext
            .Suppliers
            .Where(s => s.Id == id && s.UserId == userId)
            .Select(SupplierQueries.ProjectToDto())
            .FirstOrDefaultAsync();

        if (supplier is null)
        {
            return NotFound();
        }

        return Ok(supplier);
    }

    [HttpPost]
    public async Task<ActionResult<SupplierDto>> CreateSupplier(CreateSupplierDto createSupplierDto, IValidator<CreateSupplierDto> validator)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        // Validate the DTO
        await validator.ValidateAndThrowAsync(createSupplierDto);

        var supplier = createSupplierDto.ToEntity(userId);

        dbContext.Suppliers.Add(supplier);
        await dbContext.SaveChangesAsync();

        var supplierDto = supplier.ToDto();

        return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplierDto);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> UpdateSupplier(long id, UpdateSupplierDto updateSupplierDto, IValidator<UpdateSupplierDto> validator)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        // Validate the DTO
        await validator.ValidateAndThrowAsync(updateSupplierDto);

        Supplier? supplier = await dbContext
            .Suppliers
            .Where(s => s.UserId == userId)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (supplier is null)
        {
            return NotFound();
        }

        supplier.UpdateFromDto(updateSupplierDto);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> DeleteSupplier(long id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        Supplier? supplier = await dbContext
            .Suppliers
            .Where(s => s.UserId == userId)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (supplier is null)
        {
            return NotFound();
        }

        // Note: Check for purchases relationship when Purchase entity is implemented
        // bool hasPurchases = await dbContext
        //     .Purchases
        //     .AnyAsync(p => p.SupplierId == id);

        // if (hasPurchases)
        // {
        //     return Conflict(new { message = "Cannot delete supplier with existing purchases" });
        // }

        dbContext.Suppliers.Remove(supplier);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id:long}/toggle-status")]
    public async Task<ActionResult> ToggleSupplierStatus(long id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        Supplier? supplier = await dbContext
            .Suppliers
            .Where(s => s.UserId == userId)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (supplier is null)
        {
            return NotFound();
        }

        supplier.IsActive = !supplier.IsActive;
        supplier.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}
