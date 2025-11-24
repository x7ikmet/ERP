using ERP.Api.Database;
using ERP.Api.Services;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace ERP.Api.DTOs.Suppliers;

public sealed record UpdateSupplierDto
{
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Phone { get; init; }
    public string? Address { get; init; }
    public string? ContactPerson { get; init; }
    public bool IsActive { get; init; } = true;
}

public sealed class UpdateSupplierDtoValidator : AbstractValidator<UpdateSupplierDto>
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UpdateSupplierDtoValidator(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Supplier name is required")
            .MaximumLength(255).WithMessage("Supplier name must not exceed 255 characters");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Please provide a valid email address")
            .MaximumLength(255).WithMessage("Email must not exceed 255 characters")
            .MustAsync(BeUniqueEmail).WithMessage("Email already exists");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone number is required")
            .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters")
            .Matches(@"^[\+]?[1-9][\d]{0,15}$")
            .WithMessage("Please provide a valid phone number")
            .MustAsync(BeUniquePhone).WithMessage("Phone number already exists");

        RuleFor(x => x.Address)
            .MaximumLength(500).WithMessage("Address must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Address));

        RuleFor(x => x.ContactPerson)
            .MaximumLength(255).WithMessage("Contact person name must not exceed 255 characters")
            .When(x => !string.IsNullOrEmpty(x.ContactPerson));
    }

    private async Task<bool> BeUniqueEmail(string email, CancellationToken cancellationToken)
    {
        // Get the current supplier ID from route parameter
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.Request.RouteValues.TryGetValue("id", out var idValue) == true && 
            long.TryParse(idValue?.ToString(), out var supplierId))
        {
            return !await _context.Suppliers.AnyAsync(s => s.Email.ToLower() == email.ToLower() && s.Id != supplierId, cancellationToken);
        }
        
        return !await _context.Suppliers.AnyAsync(s => s.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    private async Task<bool> BeUniquePhone(string phone, CancellationToken cancellationToken)
    {
        // Get the current supplier ID from route parameter
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.Request.RouteValues.TryGetValue("id", out var idValue) == true && 
            long.TryParse(idValue?.ToString(), out var supplierId))
        {
            return !await _context.Suppliers.AnyAsync(s => s.Phone == phone && s.Id != supplierId, cancellationToken);
        }
        
        return !await _context.Suppliers.AnyAsync(s => s.Phone == phone, cancellationToken);
    }
}
