using ERP.Api.Database;
using ERP.Api.Services;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace ERP.Api.DTOs.Sales;

public sealed record CreateSaleDto
{
    public long? CustomerId { get; init; }
    public required List<CreateSaleItemDto> Items { get; init; } = [];
}

public sealed record CreateSaleItemDto
{
    public required long ProductId { get; init; }
    public required int Quantity { get; init; }
    public required decimal UnitPrice { get; init; }
}

public sealed class CreateSaleDtoValidator : AbstractValidator<CreateSaleDto>
{
    private readonly ApplicationDbContext _context;
    private readonly UserContext _userContext;

    public CreateSaleDtoValidator(ApplicationDbContext context, UserContext userContext)
    {
        _context = context;
        _userContext = userContext;

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one item is required")
            .Must(items => items.Count > 0).WithMessage("Sale must contain at least one item");

        RuleForEach(x => x.Items).SetValidator(new CreateSaleItemDtoValidator(_context, _userContext));

        When(x => x.CustomerId.HasValue, () =>
        {
            RuleFor(x => x.CustomerId)
                .MustAsync(BeValidCustomer).WithMessage("Invalid customer");
        });
    }

    private async Task<bool> BeValidCustomer(long? customerId, CancellationToken cancellationToken)
    {
        if (!customerId.HasValue) 
        {
            return true;
        }

        var userId = await _userContext.GetUserIdAsync(cancellationToken);
        return await _context.Customers
            .AnyAsync(c => c.Id == customerId && c.UserId == userId && c.IsActive, cancellationToken);
    }
}

public sealed class CreateSaleItemDtoValidator : AbstractValidator<CreateSaleItemDto>
{
    private readonly ApplicationDbContext _context;
    private readonly UserContext _userContext;

    public CreateSaleItemDtoValidator(ApplicationDbContext context, UserContext userContext)
    {
        _context = context;
        _userContext = userContext;

        RuleFor(x => x.ProductId)
            .GreaterThan(0).WithMessage("Valid product must be selected")
            .MustAsync(BeValidProduct).WithMessage("Product not found or inactive");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than zero");

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Unit price must be zero or positive")
            .PrecisionScale(12, 2, true).WithMessage("Unit price must have maximum 2 decimal places");
    }

    private async Task<bool> BeValidProduct(long productId, CancellationToken cancellationToken)
    {
        var userId = await _userContext.GetUserIdAsync(cancellationToken);
        return await _context.Products
            .AnyAsync(p => p.Id == productId && p.UserId == userId && p.IsActive, cancellationToken);
    }
}
