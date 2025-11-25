using System.Linq.Expressions;
using ERP.Api.Entities;

namespace ERP.Api.DTOs.Sales;

internal static class SaleQueries
{
    public static Expression<Func<Sale, SaleDto>> ProjectToDto()
    {
        return s => new SaleDto
        {
            Id = s.Id,
            CustomerId = s.CustomerId,
            CustomerName = s.Customer != null ? s.Customer.Name : null,
            SaleNo = s.SaleNo,
            Status = s.Status,
            TotalAmount = s.TotalAmount,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt,
            Items = s.SaleItems.Select(si => new SaleItemDto
            {
                Id = si.Id,
                ProductId = si.ProductId,
                ProductName = si.Product.Name,
                ProductSku = si.Product.Sku,
                Quantity = si.Quantity,
                UnitPrice = si.UnitPrice,
                LineTotal = si.Quantity * si.UnitPrice
            }).ToList()
        };
    }
}
