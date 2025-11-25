using Microsoft.AspNetCore.Mvc;

namespace ERP.Api.DTOs.Sales;

public sealed record SalesQueryParameters
{
    [FromQuery(Name = "customer")]
    public long? CustomerId { get; set; }
    
    [FromQuery(Name = "status")]
    public string? Status { get; set; }
    
    [FromQuery(Name = "from")]
    public DateTime? FromDate { get; set; }
    
    [FromQuery(Name = "to")]
    public DateTime? ToDate { get; set; }

    [FromQuery(Name = "search")]
    public string? Search { get; set; }

    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}
