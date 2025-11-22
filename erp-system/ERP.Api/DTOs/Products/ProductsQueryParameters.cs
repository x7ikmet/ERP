using Microsoft.AspNetCore.Mvc;

namespace ERP.Api.DTOs.Products;

public sealed record ProductsQueryParameters
{
    [FromQuery(Name = "q")]
    public string? Search { get; set; }
    
    [FromQuery(Name = "category")]
    public string? CategoryName { get; set; }

    public int Page { get; init;} = 1;
    public int PageSize { get; init;} = 10;
}
