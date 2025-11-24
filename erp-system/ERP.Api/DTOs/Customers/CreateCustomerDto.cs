using ERP.Api.Database;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace ERP.Api.DTOs.Customers;

public sealed record CreateCustomerDto
{
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Phone { get; init; }
    public string? Address { get; init; }
    public string? ContactPerson { get; init; }
    public bool IsActive { get; init; } = true;
}

public sealed class CreateCustomerDtoValidator : AbstractValidator<CreateCustomerDto>
{
    private readonly ApplicationDbContext _context;

    public CreateCustomerDtoValidator(ApplicationDbContext context)
    {
        _context = context;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Customer name is required")
            .MaximumLength(255).WithMessage("Customer name must not exceed 255 characters");

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
        return !await _context.Customers.AnyAsync(c => c.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    private async Task<bool> BeUniquePhone(string phone, CancellationToken cancellationToken)
    {
        return !await _context.Customers.AnyAsync(c => c.Phone == phone, cancellationToken);
    }
}
