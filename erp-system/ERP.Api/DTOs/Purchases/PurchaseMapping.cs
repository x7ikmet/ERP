using ERP.Api.Entities;

namespace ERP.Api.DTOs.Purchases;

public static class PurchaseMapping
{
    public static PurchaseDto ToDto(this Purchase purchase)
    {
        return new PurchaseDto
        {
            Id = purchase.Id,
            SupplierId = purchase.SupplierId,
            SupplierName = purchase.Supplier?.Name,
            PurchaseNo = purchase.PurchaseNo,
            Status = purchase.Status,
            TotalAmount = purchase.TotalAmount,
            CreatedAt = purchase.CreatedAt,
            UpdatedAt = purchase.UpdatedAt,
            Items = purchase.PurchaseItems?.Select(pi => pi.ToDto()).ToList() ?? []
        };
    }

    public static PurchaseItemDto ToDto(this PurchaseItem purchaseItem)
    {
        return new PurchaseItemDto
        {
            Id = purchaseItem.Id,
            ProductId = purchaseItem.ProductId,
            ProductName = purchaseItem.Product?.Name ?? string.Empty,
            ProductSku = purchaseItem.Product?.Sku ?? string.Empty,
            Quantity = purchaseItem.Quantity,
            UnitCost = purchaseItem.UnitCost,
            LineTotal = purchaseItem.LineTotal
        };
    }

    public static Purchase ToEntity(this CreatePurchaseDto dto, string userId, string purchaseNo)
    {
        var purchase = new Purchase
        {
            UserId = userId,
            SupplierId = dto.SupplierId,
            PurchaseNo = purchaseNo,
            Status = "draft",
            CreatedAt = DateTime.UtcNow
        };

        foreach (var itemDto in dto.Items)
        {
            purchase.PurchaseItems.Add(new PurchaseItem
            {
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitCost = itemDto.UnitCost
            });
        }

        purchase.TotalAmount = purchase.PurchaseItems.Sum(pi => pi.Quantity * pi.UnitCost);
        return purchase;
    }

    public static void UpdateFromDto(this Purchase purchase, UpdatePurchaseDto dto)
    {
        purchase.SupplierId = dto.SupplierId;
        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            purchase.Status = dto.Status;
        }
        purchase.UpdatedAt = DateTime.UtcNow;

        // Clear existing items
        purchase.PurchaseItems.Clear();

        // Add updated items
        foreach (var itemDto in dto.Items)
        {
            purchase.PurchaseItems.Add(new PurchaseItem
            {
                Id = itemDto.Id ?? 0,
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitCost = itemDto.UnitCost
            });
        }

        purchase.TotalAmount = purchase.PurchaseItems.Sum(pi => pi.Quantity * pi.UnitCost);
    }
}