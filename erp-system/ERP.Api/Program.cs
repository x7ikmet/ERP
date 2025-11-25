using ERP.Api;
using ERP.Api.Database;
using ERP.Api.Extensions;
using ERP.Api.Middleware;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;

var builder = WebApplication.CreateBuilder(args);

builder
    .AddControllers()
    .AddErrorHandling()
    .AddDatebase()
    .AddApplicationServices()
    .AddAuthenticationServices();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    await app.ApplyMigrationsAsync();
}

app.UseHttpsRedirection();

app.UsePathBase("/api");

app.UseExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

await app.RunAsync();
