using ERP.Api.Database;
using ERP.Api.Entities;
using ERP.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERP.Api.DTOs.Products;

namespace ERP.Api.Controllers;

[ApiController]
[Route("products")]
public sealed class ProductController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public  async Task<ActionResult<ProductDto>> GetProduct()
    {
        List<ProductDto> products = await dbContext
            .Products
            .Select(ProductQueries.ProjectToDto())
            .ToListAsync();

        var productsCollection = new ProductsCollection
        {
            Data = products
        };

        return Ok(productsCollection);
    }

    

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ProductDto>> GetProduct(long id)
    {
        var product = await dbContext
            .Products
            .Where(p => p.Id == id)
            .Select(ProductQueries.ProjectToDto())
            .FirstOrDefaultAsync();

        if (product is null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto createProductDto){
        var product = createProductDto.ToEntity();

        dbContext.Products.Add(product);
        await dbContext.SaveChangesAsync();

        var productDto = product.ToDto();

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, productDto);

    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(long id, UpdateProductDto updateProductDto)
    {
        Product? product = await dbContext
            .Products
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product is null)
        {
            return NotFound();
        }

        product.UpdateFromDto(updateProductDto);

        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}
