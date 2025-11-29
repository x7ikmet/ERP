using ERP.Api.Entities;
using System.Linq.Expressions;

namespace ERP.Api.DTOs.Purchases;

public static class PurchaseQueries
{
    public static Expression<Func<Purchase, PurchaseDto>> ProjectToDto()
    {
        return p => new PurchaseDto
        {
            Id = p.Id,
            SupplierId = p.SupplierId,
            SupplierName = p.Supplier != null ? p.Supplier.Name : string.Empty,
            PurchaseNo = p.PurchaseNo,
            Status = p.Status,
            TotalAmount = p.TotalAmount,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            Items = p.PurchaseItems.Select(pi => new PurchaseItemDto
            {
                Id = pi.Id,
                ProductId = pi.ProductId,
                ProductName = pi.Product.Name ?? string.Empty,
                ProductSku = pi.Product.Sku ?? string.Empty,
                Quantity = pi.Quantity,
                UnitCost = pi.UnitCost,
                LineTotal = pi.LineTotal
            }).ToList()
        };
    }
}