using ERP.Api.Database;
using ERP.Api.Entities;
using ERP.Api.DTOs.Sales;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using ERP.Api.Services;
using FluentValidation;
using ERP.Api.DTOs.Common;

namespace ERP.Api.Controllers;

[Authorize]
[ApiController]
[Route("sales")]
public sealed class SaleController(
    ApplicationDbContext dbContext,
    UserContext userContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginationResult<SaleDto>>> GetSales(
        [FromQuery] SalesQueryParameters query)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var search = query.Search?.Trim().ToLower();

        IQueryable<SaleDto> salesQuery = dbContext
            .Sales
            .Where(s => s.UserId == userId)
            .Where(s => query.CustomerId == null || s.CustomerId == query.CustomerId)
            .Where(s => string.IsNullOrEmpty(query.Status) || s.Status.ToLower() == query.Status.ToLower())
            .Where(s => query.FromDate == null || s.CreatedAt >= query.FromDate)
            .Where(s => query.ToDate == null || s.CreatedAt <= query.ToDate)
            .Where(s => search == null || s.SaleNo.ToLower().Contains(search) ||
                       s.Customer != null && s.Customer.Name.ToLower().Contains(search))
            .Include(s => s.Customer)
            .Include(s => s.SaleItems)
                .ThenInclude(si => si.Product)
            .Select(SaleQueries.ProjectToDto());

        var paginationResult = await PaginationResult<SaleDto>.CreateAsync(
            salesQuery,
            query.Page,
            query.PageSize);

        return Ok(paginationResult);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<SaleDto>> GetSale(long id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var sale = await dbContext
            .Sales
            .Where(s => s.Id == id && s.UserId == userId)
            .Include(s => s.Customer)
            .Include(s => s.SaleItems)
                .ThenInclude(si => si.Product)
            .Select(SaleQueries.ProjectToDto())
            .FirstOrDefaultAsync();

        if (sale is null)
        {
            return NotFound();
        }

        return Ok(sale);
    }

    [HttpPost]
    public async Task<ActionResult<SaleDto>> CreateSale(
        CreateSaleDto createSaleDto, 
        IValidator<CreateSaleDto> validator)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        // Validate the DTO
        await validator.ValidateAndThrowAsync(createSaleDto);

        // Generate sale number
        var saleNo = await GenerateSaleNumberAsync(userId);

        var sale = createSaleDto.ToEntity(userId, saleNo);

        dbContext.Sales.Add(sale);
        await dbContext.SaveChangesAsync();

        // Load the created sale with includes
        var createdSale = await dbContext
            .Sales
            .Where(s => s.Id == sale.Id)
            .Include(s => s.Customer)
            .Include(s => s.SaleItems)
                .ThenInclude(si => si.Product)
            .FirstAsync();

        var saleDto = createdSale.ToDto();

        return CreatedAtAction(nameof(GetSale), new { id = sale.Id }, saleDto);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> UpdateSale(
        long id, 
        UpdateSaleDto updateSaleDto, 
        IValidator<UpdateSaleDto> validator)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        // Validate the DTO
        await validator.ValidateAndThrowAsync(updateSaleDto);

        Sale? sale = await dbContext
            .Sales
            .Include(s => s.SaleItems)
            .Where(s => s.UserId == userId)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale is null)
        {
            return NotFound();
        }

        // Check if sale can be updated
        if (sale.Status == "completed")
        {
            return BadRequest(new { message = "Cannot update completed sale" });
        }

        sale.UpdateFromDto(updateSaleDto);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> DeleteSale(long id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        Sale? sale = await dbContext
            .Sales
            .Where(s => s.UserId == userId)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale is null)
        {
            return NotFound();
        }

        // Check if sale can be deleted
        if (sale.Status == "completed")
        {
            return BadRequest(new { message = "Cannot delete completed sale" });
        }

        dbContext.Sales.Remove(sale);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id:long}/complete")]
    public async Task<ActionResult> CompleteSale(long id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        Sale? sale = await dbContext
            .Sales
            .Include(s => s.SaleItems)
                .ThenInclude(si => si.Product)
            .Where(s => s.UserId == userId)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale is null)
        {
            return NotFound();
        }

        if (sale.Status != "draft")
        {
            return BadRequest(new { message = "Only draft sales can be completed" });
        }

        // Update stock quantities
        foreach (var item in sale.SaleItems)
        {
            if (item.Product.StockQty < item.Quantity)
            {
                return BadRequest(new { message = $"Insufficient stock for product {item.Product.Name}" });
            }
            
            item.Product.StockQty -= item.Quantity;
            item.Product.UpdatedAt = DateTime.UtcNow;
        }

        sale.Status = "completed";
        sale.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id:long}/cancel")]
    public async Task<ActionResult> CancelSale(long id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        Sale? sale = await dbContext
            .Sales
            .Where(s => s.UserId == userId)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale is null)
        {
            return NotFound();
        }

        if (sale.Status == "completed")
        {
            return BadRequest(new { message = "Cannot cancel completed sale" });
        }

        sale.Status = "canceled";
        sale.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private async Task<string> GenerateSaleNumberAsync(string userId)
    {
        var lastSale = await dbContext
            .Sales
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.Id)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastSale != null && lastSale.SaleNo.StartsWith("SALE-", StringComparison.Ordinal))
        {
            var numberPart = lastSale.SaleNo.Substring(5);
            if (int.TryParse(numberPart, out var lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
        }

        return $"SALE-{nextNumber:D6}";
    }
}
