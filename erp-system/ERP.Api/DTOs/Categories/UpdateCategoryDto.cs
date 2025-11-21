namespace ERP.Api.DTOs.Categories;

public sealed record UpdateCategoryDto
{
    public required string Name { get; init; }
    public required string Slug { get; init; }
    public string? Description { get; init; }
}
