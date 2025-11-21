using ERP.Api.Database;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace ERP.Api.DTOs.Products;

public sealed record CreateProductDto
{
    public required string Name { get; init; }
    public string? Sku { get; init; }
    public required string Slug { get; init; }
    public required int CategoryId { get; init; }
    public required decimal UnitPrice { get; init; }
    public required decimal CostPrice { get; init; }
    public required int StockQty { get; init; }
    public string? Barcode { get; init; }
    public required bool IsActive { get; init; }
}


public sealed class CreateProductDtoValidator: AbstractValidator<CreateProductDto>
{
    private readonly ApplicationDbContext _context;

    public CreateProductDtoValidator(ApplicationDbContext context)
    {
        _context = context;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required")
            .MaximumLength(255).WithMessage("Product name must not exceed 255 characters");

        RuleFor(x => x.Sku)
            .MaximumLength(100).WithMessage("SKU must not exceed 100 characters")
            .MustAsync(BeUniqueSku).WithMessage("SKU already exists")
            .When(x => !string.IsNullOrEmpty(x.Sku));

        RuleFor(x => x.Slug)
            .NotEmpty().WithMessage("Slug is required")
            .MaximumLength(255).WithMessage("Slug must not exceed 255 characters")
            .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$")
            .WithMessage("Slug must be lowercase alphanumeric with hyphens only (e.g., 'product-name')")
            .MustAsync(BeUniqueSlug).WithMessage("Slug already exists");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("Valid category must be selected");

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Unit price must be zero or positive")
            .PrecisionScale(12, 2, true).WithMessage("Unit price must have maximum 2 decimal places and 12 total digits");

        RuleFor(x => x.CostPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Cost price must be zero or positive")
            .PrecisionScale(12, 2, true).WithMessage("Cost price must have maximum 2 decimal places and 12 total digits");

        RuleFor(x => x.StockQty)
            .GreaterThanOrEqualTo(0).WithMessage("Stock quantity must be zero or positive");

        RuleFor(x => x.Barcode)
            .MaximumLength(100).WithMessage("Barcode must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Barcode));
    }

    private async Task<bool> BeUniqueSku(string? sku, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(sku))
        {
            return true;
        }

        return !await _context.Products.AnyAsync(p => p.Sku == sku, cancellationToken);
    }

    private async Task<bool> BeUniqueSlug(string slug, CancellationToken cancellationToken)
    {
        return !await _context.Products.AnyAsync(p => p.Slug == slug, cancellationToken);
    }
}
