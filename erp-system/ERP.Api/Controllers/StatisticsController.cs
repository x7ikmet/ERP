using ERP.Api.Database;
using ERP.Api.DTOs.Statistics;
using ERP.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Api.Controllers;

[Authorize]
[ApiController]
[Route("statistics")]
public sealed class StatisticsController(
    ApplicationDbContext dbContext,
    UserContext userContext) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardStatisticsDto>> GetDashboardStatistics()
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        // Get total sales amount from completed sales
        var totalSales = await dbContext.Sales
            .Where(s => s.UserId == userId && s.Status == "completed")
            .SumAsync(s => s.TotalAmount);

        // Get total products count
        var totalProducts = await dbContext.Products
            .CountAsync(p => p.UserId == userId);

        // Get total customers count
        var totalCustomers = await dbContext.Customers
            .CountAsync(c => c.UserId == userId);

        // Get active customers count
        var activeCustomers = await dbContext.Customers
            .CountAsync(c => c.UserId == userId && c.IsActive);

        // Get completed sales count
        var completedSalesCount = await dbContext.Sales
            .CountAsync(s => s.UserId == userId && s.Status == "completed");

        // Get pending sales count (draft status)
        var pendingSalesCount = await dbContext.Sales
            .CountAsync(s => s.UserId == userId && s.Status == "draft");

        var statistics = new DashboardStatisticsDto
        {
            TotalSales = totalSales,
            TotalProducts = totalProducts,
            TotalCustomers = totalCustomers,
            ActiveCustomers = activeCustomers,
            CompletedSalesCount = completedSalesCount,
            PendingSalesCount = pendingSalesCount
        };

        return Ok(statistics);
    }

    [HttpGet("sales")]
    public async Task<ActionResult<SalesStatisticsDto>> GetSalesStatistics()
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var salesQuery = dbContext.Sales.Where(s => s.UserId == userId);

        // Get total sales amount from completed sales
        var totalSales = await salesQuery
            .Where(s => s.Status == "completed")
            .SumAsync(s => s.TotalAmount);

        // Get sales counts by status
        var completedSalesCount = await salesQuery
            .CountAsync(s => s.Status == "completed");

        var pendingSalesCount = await salesQuery
            .CountAsync(s => s.Status == "draft");

        var cancelledSalesCount = await salesQuery
            .CountAsync(s => s.Status == "canceled");

        // Calculate average sale amount
        var averageSaleAmount = completedSalesCount > 0 ? totalSales / completedSalesCount : 0;

        // Get last sale date
        var lastSaleDate = await salesQuery
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => (DateTime?)s.CreatedAt)
            .FirstOrDefaultAsync();

        var statistics = new SalesStatisticsDto
        {
            TotalSales = totalSales,
            CompletedSalesCount = completedSalesCount,
            PendingSalesCount = pendingSalesCount,
            CancelledSalesCount = cancelledSalesCount,
            AverageSaleAmount = averageSaleAmount,
            LastSaleDate = lastSaleDate
        };

        return Ok(statistics);
    }

    [HttpGet("products")]
    public async Task<ActionResult<ProductStatisticsDto>> GetProductStatistics()
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var productsQuery = dbContext.Products.Where(p => p.UserId == userId);

        // Get total products count
        var totalProducts = await productsQuery.CountAsync();

        // Get active products count
        var activeProducts = await productsQuery
            .CountAsync(p => p.IsActive);

        // Get low stock products (assuming stock quantity < 10 is low stock)
        var lowStockProducts = await productsQuery
            .CountAsync(p => p.StockQty > 0 && p.StockQty < 10);

        // Get out of stock products
        var outOfStockProducts = await productsQuery
            .CountAsync(p => p.StockQty <= 0);

        // Calculate total inventory value
        var totalInventoryValue = await productsQuery
            .SumAsync(p => p.StockQty * p.UnitPrice);

        var statistics = new ProductStatisticsDto
        {
            TotalProducts = totalProducts,
            ActiveProducts = activeProducts,
            LowStockProducts = lowStockProducts,
            OutOfStockProducts = outOfStockProducts,
            TotalInventoryValue = totalInventoryValue
        };

        return Ok(statistics);
    }

    [HttpGet("customers")]
    public async Task<ActionResult<CustomerStatisticsDto>> GetCustomerStatistics()
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var customersQuery = dbContext.Customers.Where(c => c.UserId == userId);

        // Get total customers count
        var totalCustomers = await customersQuery.CountAsync();

        // Get active customers count
        var activeCustomers = await customersQuery
            .CountAsync(c => c.IsActive);

        // Get inactive customers count
        var inactiveCustomers = totalCustomers - activeCustomers;

        // Get customers with sales count
        var customersWithSales = await dbContext.Sales
            .Where(s => s.UserId == userId && s.CustomerId != null)
            .Select(s => s.CustomerId)
            .Distinct()
            .CountAsync();

        // Get last customer added date
        var lastCustomerAdded = await customersQuery
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => (DateTime?)c.CreatedAt)
            .FirstOrDefaultAsync();

        var statistics = new CustomerStatisticsDto
        {
            TotalCustomers = totalCustomers,
            ActiveCustomers = activeCustomers,
            InactiveCustomers = inactiveCustomers,
            CustomersWithSales = customersWithSales,
            LastCustomerAdded = lastCustomerAdded
        };

        return Ok(statistics);
    }

    [HttpGet("total-sales")]
    public async Task<ActionResult<decimal>> GetTotalSales()
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var totalSales = await dbContext.Sales
            .Where(s => s.UserId == userId && s.Status == "completed")
            .SumAsync(s => s.TotalAmount);

        return Ok(totalSales);
    }

    [HttpGet("total-products")]
    public async Task<ActionResult<int>> GetTotalProducts()
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var totalProducts = await dbContext.Products
            .CountAsync(p => p.UserId == userId);

        return Ok(totalProducts);
    }

    [HttpGet("total-customers")]
    public async Task<ActionResult<int>> GetTotalCustomers()
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var totalCustomers = await dbContext.Customers
            .CountAsync(c => c.UserId == userId);

        return Ok(totalCustomers);
    }
}