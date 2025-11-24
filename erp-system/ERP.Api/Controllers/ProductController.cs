using ERP.Api.Database;
using ERP.Api.Entities;
using ERP.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERP.Api.DTOs.Products;
using FluentValidation;
using ERP.Api.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using ERP.Api.Services;

namespace ERP.Api.Controllers;

[Authorize]
[ApiController]
[Route("products")]
public sealed class ProductController(
    ApplicationDbContext dbContext,
    UserContext userContext) : ControllerBase
{
    [HttpGet]
    public  async Task<ActionResult<PaginationResult<ProductDto>>> GetProducts(
        [FromQuery] ProductsQueryParameters query
        )
    {

        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var search = query.Search?.Trim().ToLower();
        var categoryName = query.CategoryName?.Trim().ToLower();

        IQueryable<ProductDto> productsQuery = dbContext
            .Products
            .Where(x => x.UserId == userId)
            .Where(x => search == null ||
                        x.Name.ToLower().Contains(search))
            .Where(x => categoryName == null ||
                        x.Category.Name.ToLower() == categoryName)
            .Select(ProductQueries.ProjectToDto());

        var paginationResult = await PaginationResult<ProductDto>.CreateAsync(
            productsQuery,
            query.Page,
            query.PageSize
        );

        return Ok(paginationResult);

    }

    

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ProductDto>> GetProduct(long id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var product = await dbContext
            .Products
            .Where(p => p.Id == id && p.UserId == userId)
            .Select(ProductQueries.ProjectToDto())
            .FirstOrDefaultAsync();

        if (product is null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto createProductDto, IValidator<CreateProductDto> validator)
    {

        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        await validator.ValidateAndThrowAsync(createProductDto);

        var product = createProductDto.ToEntity(userId);

        dbContext.Products.Add(product);
        await dbContext.SaveChangesAsync();

        var productDto = product.ToDto();

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, productDto);

    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(long id, UpdateProductDto updateProductDto)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        Product? product = await dbContext
            .Products
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (product is null)
        {
            return NotFound();
        }

        product.UpdateFromDto(updateProductDto);

        await dbContext.SaveChangesAsync();

        return NoContent();
    }


    [HttpDelete("{id:long}")]
    public async Task<ActionResult> DeleteProduct(long id)
    {

        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        Product? product = await dbContext
            .Products
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (product is null)
        {
            return NotFound();
        }

        dbContext.Products.Remove(product);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}
