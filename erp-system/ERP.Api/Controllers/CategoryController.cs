using ERP.Api.Database;
using ERP.Api.Entities;
using ERP.Api.DTOs.Categories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERP.Api.Controllers;

[ApiController]
[Route("categories")]
public sealed class CategoryController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<CategoriesCollection>> GetCategories()
    {
        List<CategoryDto> categories = await dbContext
            .Categories
            .Select(CategoryQueries.ProjectToDto())
            .ToListAsync();

        var categoriesCollection = new CategoriesCollection
        {
            Items = categories
        };

        return Ok(categoriesCollection);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(int id)
    {
        var category = await dbContext
            .Categories
            .Where(c => c.Id == id)
            .Select(CategoryQueries.ProjectToDto())
            .FirstOrDefaultAsync();

        if (category is null)
        {
            return NotFound();
        }

        return Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory(CreateCategoryDto createCategoryDto)
    {
        var category = createCategoryDto.ToEntity();

        dbContext.Categories.Add(category);
        await dbContext.SaveChangesAsync();

        var categoryDto = category.ToDto();

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, categoryDto);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateCategory(int id, UpdateCategoryDto updateCategoryDto)
    {
        Category? category = await dbContext
            .Categories
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category is null)
        {
            return NotFound();
        }

        category.UpdateFromDto(updateCategoryDto);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteCategory(int id)
    {
        Category? category = await dbContext
            .Categories
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category is null)
        {
            return NotFound();
        }

        // Check if category has products (Restrict behavior)
        bool hasProducts = await dbContext
            .Products
            .AnyAsync(p => p.CategoryId == id);

        if (hasProducts)
        {
            return Conflict(new { message = "Cannot delete category with existing products" });
        }

        dbContext.Categories.Remove(category);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}
