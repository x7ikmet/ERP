using System.Runtime.CompilerServices;
using ERP.Api.DTOs.Auth;
using ERP.Api.Entities;

namespace ERP.Api.DTOs.Users;

public static class UserMappings
{
    public static User ToEntity(this RegisterUserDto dto)
    {
        return new User
        {
            Id = $"u_{Guid.CreateVersion7()}",
            Name = dto.Name,
            Email = dto.Email,
            CreatedAtUtc = DateTime.UtcNow
        };
    }
}
