using ERP.Api.Database;
using ERP.Api.Entities;
using ERP.Api.DTOs.Purchases;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using ERP.Api.Services;
using FluentValidation;
using ERP.Api.DTOs.Common;

namespace ERP.Api.Controllers;

[Authorize]
[ApiController]
[Route("purchases")]
public sealed class PurchaseController(
    ApplicationDbContext dbContext,
    UserContext userContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginationResult<PurchaseDto>>> GetPurchases(
        [FromQuery] PurchasesQueryParameters query)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var search = query.Search?.Trim().ToLower();

        IQueryable<PurchaseDto> purchasesQuery = dbContext
            .Purchases
            .Where(p => p.UserId == userId)
            .Where(p => query.SupplierId == null || p.SupplierId == query.SupplierId)
            .Where(p => string.IsNullOrEmpty(query.Status) || p.Status.ToLower() == query.Status.ToLower())
            .Where(p => query.FromDate == null || p.CreatedAt >= query.FromDate)
            .Where(p => query.ToDate == null || p.CreatedAt <= query.ToDate)
            .Where(p => search == null || p.PurchaseNo.ToLower().Contains(search) ||
                       p.Supplier != null && p.Supplier.Name.ToLower().Contains(search))
            .Include(p => p.Supplier)
            .Include(p => p.PurchaseItems)
                .ThenInclude(pi => pi.Product)
            .Select(PurchaseQueries.ProjectToDto());

        var paginationResult = await PaginationResult<PurchaseDto>.CreateAsync(
            purchasesQuery,
            query.Page,
            query.PageSize);

        return Ok(paginationResult);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<PurchaseDto>> GetPurchase(long id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var purchase = await dbContext
            .Purchases
            .Where(p => p.Id == id && p.UserId == userId)
            .Include(p => p.Supplier)
            .Include(p => p.PurchaseItems)
                .ThenInclude(pi => pi.Product)
            .Select(PurchaseQueries.ProjectToDto())
            .FirstOrDefaultAsync();

        if (purchase is null)
        {
            return NotFound();
        }

        return Ok(purchase);
    }

    [HttpPost]
    public async Task<ActionResult<PurchaseDto>> CreatePurchase(
        CreatePurchaseDto createPurchaseDto, 
        IValidator<CreatePurchaseDto> validator)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        await validator.ValidateAndThrowAsync(createPurchaseDto);

        var purchaseNo = await GeneratePurchaseNumberAsync(userId);

        var purchase = createPurchaseDto.ToEntity(userId, purchaseNo);

        dbContext.Purchases.Add(purchase);
        await dbContext.SaveChangesAsync();

        var purchaseDto = purchase.ToDto();

        return CreatedAtAction(nameof(GetPurchase), new { id = purchase.Id }, purchaseDto);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult> UpdatePurchase(
        long id, 
        UpdatePurchaseDto updatePurchaseDto, 
        IValidator<UpdatePurchaseDto> validator)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        await validator.ValidateAndThrowAsync(updatePurchaseDto);

        Purchase? purchase = await dbContext
            .Purchases
            .Include(p => p.PurchaseItems)
            .Where(p => p.UserId == userId)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (purchase is null)
        {
            return NotFound();
        }

        if (purchase.Status == "completed")
        {
            return BadRequest(new { message = "Cannot update completed purchase" });
        }

        purchase.UpdateFromDto(updatePurchaseDto);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> DeletePurchase(long id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        Purchase? purchase = await dbContext
            .Purchases
            .Where(p => p.UserId == userId)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (purchase is null)
        {
            return NotFound();
        }

        if (purchase.Status == "completed")
        {
            return BadRequest(new { message = "Cannot delete completed purchase" });
        }

        dbContext.Purchases.Remove(purchase);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id:long}/complete")]
    public async Task<ActionResult> CompletePurchase(long id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        Purchase? purchase = await dbContext
            .Purchases
            .Include(p => p.PurchaseItems)
                .ThenInclude(pi => pi.Product)
            .Where(p => p.UserId == userId)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (purchase is null)
        {
            return NotFound();
        }

        if (purchase.Status != "draft")
        {
            return BadRequest(new { message = "Only draft purchases can be completed" });
        }

        // TO DO: Future inventory integration added here

        purchase.Status = "completed";
        purchase.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id:long}/cancel")]
    public async Task<ActionResult> CancelPurchase(long id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        Purchase? purchase = await dbContext
            .Purchases
            .Where(p => p.UserId == userId)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (purchase is null)
        {
            return NotFound();
        }

        if (purchase.Status == "completed")
        {
            return BadRequest(new { message = "Cannot cancel completed purchase" });
        }

        purchase.Status = "canceled";
        purchase.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private async Task<string> GeneratePurchaseNumberAsync(string userId)
    {
        var lastPurchase = await dbContext
            .Purchases
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.Id)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastPurchase != null && lastPurchase.PurchaseNo.StartsWith("PURCH-", StringComparison.Ordinal))
        {
            var numberPart = lastPurchase.PurchaseNo.Substring(6);
            if (int.TryParse(numberPart, out var lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
        }

        return $"PURCH-{nextNumber:D6}";
    }
}
