using ERP.Api.Entities;

namespace ERP.Api.DTOs.Products;

internal static class ProductMapping
{
    public static ProductDto ToDto(this Product p)
    {
        return new ProductDto
        {
            Id = p.Id,
            Sku = p.Sku,
            Name = p.Name,
            Slug = p.Slug,
            CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name ?? string.Empty,
            CategorySlug = p.Category?.Slug ?? string.Empty,
            UnitPrice = p.UnitPrice,
            CostPrice = p.CostPrice,
            StockQty = p.StockQty,
            Barcode = p.Barcode,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }

    public static Product ToEntity(this CreateProductDto dto)
    {
        Product product = new()
        {
            Sku = dto.Sku,
            Name = dto.Name,
            Slug = dto.Slug,
            CategoryId = dto.CategoryId,
            UnitPrice = dto.UnitPrice,
            CostPrice = dto.CostPrice,
            StockQty = dto.StockQty,
            Barcode = dto.Barcode,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return product;
    }

    public static void UpdateFromDto(this Product product, UpdateProductDto dto)
    {
        product.Name = dto.Name;
        product.Sku = dto.Sku;
        product.Slug = dto.Slug;
        product.CategoryId = dto.CategoryId;
        product.UnitPrice = dto.UnitPrice;
        product.CostPrice = dto.CostPrice;
        product.StockQty = dto.StockQty;
        product.Barcode = dto.Barcode;
        product.IsActive = dto.IsActive;
        product.UpdatedAt = DateTime.UtcNow;
    }
}
