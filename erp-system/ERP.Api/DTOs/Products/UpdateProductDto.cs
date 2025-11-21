using ERP.Api.Database;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace ERP.Api.DTOs.Products;

public sealed record UpdateProductDto
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

public sealed class UpdateProductDtoValidator : AbstractValidator<UpdateProductDto>
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UpdateProductDtoValidator(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;

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

        // Get the current product ID from route
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.Request.RouteValues.TryGetValue("id", out var idObj) == true 
            && long.TryParse(idObj?.ToString(), out var currentId))
        {
            // Check if SKU exists for a different product
            return !await _context.Products.AnyAsync(
                p => p.Sku == sku && p.Id != currentId, 
                cancellationToken);
        }

        // Fallback: check if SKU exists at all
        return !await _context.Products.AnyAsync(p => p.Sku == sku, cancellationToken);
    }

    private async Task<bool> BeUniqueSlug(string slug, CancellationToken cancellationToken)
    {
        // Get the current product ID from route
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.Request.RouteValues.TryGetValue("id", out var idObj) == true 
            && long.TryParse(idObj?.ToString(), out var currentId))
        {
            // Check if slug exists for a different product
            return !await _context.Products.AnyAsync(
                p => p.Slug == slug && p.Id != currentId, 
                cancellationToken);
        }

        // Fallback: check if slug exists at all
        return !await _context.Products.AnyAsync(p => p.Slug == slug, cancellationToken);
    }
}
