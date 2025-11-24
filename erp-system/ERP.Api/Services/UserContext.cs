using ERP.Api.Database;
using ERP.Api.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ERP.Api.Services;

public sealed class UserContext(
    IHttpContextAccessor httpContextAccessor,
    ApplicationDbContext dbContext,
    IMemoryCache memoryCache)
{
    private const string CacheKeyPrefix = "users:id:";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(30);

    public async Task<string?> GetUserIdAsync(CancellationToken cancellationToken = default)
    {
       string? idenetityId = httpContextAccessor.HttpContext?.User.GetIdentityId();
       if (idenetityId is null)
        {
            return null;
        }

        string cacheKey = $"{CacheKeyPrefix}{idenetityId}";
        string? userId = await memoryCache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.SetSlidingExpiration(CacheDuration);

            string? userId = await dbContext.Users
                .Where(u => u.IdentityId == idenetityId)
                .Select(u => u.Id)
                .FirstOrDefaultAsync(cancellationToken);
            return userId;
        });
        return userId;
    }

}
