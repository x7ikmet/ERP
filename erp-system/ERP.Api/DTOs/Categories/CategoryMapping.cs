using ERP.Api.Entities;

namespace ERP.Api.DTOs.Categories;

internal static class CategoryMapping
{
    public static CategoryDto ToDto(this Category c)
    {
        return new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            Description = c.Description,
            ProductCount = c.Products?.Count ?? 0
        };
    }

    public static Category ToEntity(this CreateCategoryDto dto)
    {
        return new Category
        {
            Name = dto.Name,
            Slug = dto.Slug,
            Description = dto.Description
        };
    }

    public static void UpdateFromDto(this Category category, UpdateCategoryDto dto)
    {
        category.Name = dto.Name;
        category.Slug = dto.Slug;
        category.Description = dto.Description;
    }
}
