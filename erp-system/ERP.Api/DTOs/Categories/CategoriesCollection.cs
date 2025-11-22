using ERP.Api.DTOs.Common;

namespace ERP.Api.DTOs.Categories;

public sealed record CategoriesCollection : ICollectionResponse<CategoryDto>
{
    public List<CategoryDto> Items { get; init; } = [];
}
