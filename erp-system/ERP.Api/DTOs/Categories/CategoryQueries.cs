using System.Linq.Expressions;
using ERP.Api.Entities;

namespace ERP.Api.DTOs.Categories;

internal static class CategoryQueries
{
    public static Expression<Func<Category, CategoryDto>> ProjectToDto()
    {
        return c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            Description = c.Description,
            ProductCount = c.Products.Count
        };
    }
}
