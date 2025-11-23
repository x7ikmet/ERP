using ERP.Api.Database;
using Microsoft.EntityFrameworkCore;

namespace ERP.Api.Extensions;

public static class DatabaseExtensions
{
    public static async Task ApplyMigrationsAsync(this WebApplication app)
    {
        using IServiceScope scope = app.Services.CreateScope();
        await using ApplicationDbContext applicationDbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await using ApplicationIdentityDbContext identityDbContext = scope.ServiceProvider.GetRequiredService<ApplicationIdentityDbContext>();
        try
        {
            await applicationDbContext.Database.MigrateAsync();

            app.Logger.LogInformation("Application database migrations applied successfully.");

            await identityDbContext.Database.MigrateAsync();

            app.Logger.LogInformation("Identity database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error during database migration: {ex.Message}");
            app.Logger.LogError(ex, "An error occurred while applying database migrations.");
            throw;
        }

    }
}
