using ERP.Api.Database;
using ERP.Api.Services;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace ERP.Api.DTOs.Purchases;

public sealed record CreatePurchaseDto
{
    public long? SupplierId { get; init; }
    public required List<CreatePurchaseItemDto> Items { get; init; } = [];
}

public sealed record CreatePurchaseItemDto
{
    public required long ProductId { get; init; }
    public required int Quantity { get; init; }
    public required decimal UnitCost { get; init; }
}

public sealed class CreatePurchaseDtoValidator : AbstractValidator<CreatePurchaseDto>
{
    private readonly ApplicationDbContext _context;
    private readonly UserContext _userContext;

    public CreatePurchaseDtoValidator(ApplicationDbContext context, UserContext userContext)
    {
        _context = context;
        _userContext = userContext;

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one item is required")
            .Must(items => items.Count > 0).WithMessage("Purchase must contain at least one item");

        RuleForEach(x => x.Items).SetValidator(new CreatePurchaseItemDtoValidator(_context, _userContext));

        When(x => x.SupplierId.HasValue, () =>
        {
            RuleFor(x => x.SupplierId)
                .MustAsync(BeValidSupplier).WithMessage("Invalid supplier");
        });
    }

    private async Task<bool> BeValidSupplier(long? supplierId, CancellationToken cancellationToken)
    {
        if (!supplierId.HasValue) 
        {
            return true;
        }

        string? userId = await _userContext.GetUserIdAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return false;
        }

        return await _context.Suppliers
            .Where(s => s.UserId == userId)
            .AnyAsync(s => s.Id == supplierId.Value, cancellationToken);
    }
}

public sealed class CreatePurchaseItemDtoValidator : AbstractValidator<CreatePurchaseItemDto>
{
    private readonly ApplicationDbContext _context;
    private readonly UserContext _userContext;

    public CreatePurchaseItemDtoValidator(ApplicationDbContext context, UserContext userContext)
    {
        _context = context;
        _userContext = userContext;

        RuleFor(x => x.ProductId)
            .MustAsync(BeValidProduct).WithMessage("Invalid product");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0");

        RuleFor(x => x.UnitCost)
            .GreaterThan(0).WithMessage("Unit cost must be greater than 0");
    }

    private async Task<bool> BeValidProduct(long productId, CancellationToken cancellationToken)
    {
        string? userId = await _userContext.GetUserIdAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return false;
        }

        return await _context.Products
            .Where(p => p.UserId == userId)
            .AnyAsync(p => p.Id == productId, cancellationToken);
    }
}