using ERP.Api.Entities;

namespace ERP.Api.DTOs.Sales;

internal static class SaleMapping
{
    public static SaleDto ToDto(this Sale sale)
    {
        return new SaleDto
        {
            Id = sale.Id,
            CustomerId = sale.CustomerId,
            CustomerName = sale.Customer?.Name,
            SaleNo = sale.SaleNo,
            Status = sale.Status,
            TotalAmount = sale.TotalAmount,
            CreatedAt = sale.CreatedAt,
            UpdatedAt = sale.UpdatedAt,
            Items = sale.SaleItems?.Select(si => si.ToDto()).ToList() ?? []
        };
    }

    public static SaleItemDto ToDto(this SaleItem saleItem)
    {
        return new SaleItemDto
        {
            Id = saleItem.Id,
            ProductId = saleItem.ProductId,
            ProductName = saleItem.Product?.Name ?? string.Empty,
            ProductSku = saleItem.Product?.Sku,
            Quantity = saleItem.Quantity,
            UnitPrice = saleItem.UnitPrice,
            LineTotal = saleItem.Quantity * saleItem.UnitPrice
        };
    }

    public static Sale ToEntity(this CreateSaleDto dto, string userId, string saleNo)
    {
        var sale = new Sale
        {
            UserId = userId,
            CustomerId = dto.CustomerId,
            SaleNo = saleNo,
            Status = "draft",
            CreatedAt = DateTime.UtcNow
        };

        foreach (var itemDto in dto.Items)
        {
            sale.SaleItems.Add(new SaleItem
            {
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice
            });
        }

        sale.TotalAmount = sale.SaleItems.Sum(si => si.Quantity * si.UnitPrice);
        return sale;
    }

    public static void UpdateFromDto(this Sale sale, UpdateSaleDto dto)
    {
        sale.CustomerId = dto.CustomerId;
        sale.Status = dto.Status;
        sale.UpdatedAt = DateTime.UtcNow;

        // Clear existing items
        sale.SaleItems.Clear();

        // Add updated items
        foreach (var itemDto in dto.Items)
        {
            sale.SaleItems.Add(new SaleItem
            {
                Id = itemDto.Id ?? 0,
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice
            });
        }

        sale.TotalAmount = sale.SaleItems.Sum(si => si.Quantity * si.UnitPrice);
    }
}
