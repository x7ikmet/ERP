using System.Linq.Expressions;
using ERP.Api.Entities;

namespace ERP.Api.DTOs.Products;

internal static class ProductQueries
{
    public static Expression<Func<Product, ProductDto>> ProjectToDto()
    {
        return p => new ProductDto
        {
            Id = p.Id,
            Sku = p.Sku,
            Name = p.Name,
            Slug = p.Slug,
            CategoryId = p.CategoryId,
            CategoryName = p.Category.Name,
            CategorySlug = p.Category.Slug,
            UnitPrice = p.UnitPrice,
            CostPrice = p.CostPrice,
            StockQty = p.StockQty,
            Barcode = p.Barcode,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }
}
