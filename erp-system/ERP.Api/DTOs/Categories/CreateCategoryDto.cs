namespace ERP.Api.DTOs.Categories;

public sealed record CreateCategoryDto
{
    public required string Name { get; init; }
    public required string Slug { get; init; }
    public string? Description { get; init; }
}
