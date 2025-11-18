# Complete ERP System Implementation Plan
## ASP.NET Core 9.0 API + React.js with ShadCN/UI Dark Mode + Docker
### Modern Architecture with Centralized Package Management & OpenTelemetry

---

## 🏗️ PROJECT STRUCTURE & MODERN .NET 9.0 SETUP

### Solution Structure (DevHabit Style):
```
erp-system/
├── Directory.Build.props          # Solution-wide build properties
├── Directory.Packages.props       # Centralized package management
├── docker-compose.yml            # Production Docker setup
├── docker-compose.dev.yml        # Development Docker setup
├── .env                          # Production environment
├── .env.dev                      # Development environment
├── .gitignore
├── README.md
├── src/
│   ├── ERP.API/
│   │   ├── Controllers/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Data/
│   │   ├── Middleware/
│   │   ├── Utilities/
│   │   ├── Program.cs
│   │   ├── ERP.API.csproj
│   │   ├── Dockerfile
│   │   ├── Dockerfile.dev
│   │   └── .dockerignore
│   └── ERP.Shared/               # Shared DTOs and models
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── Dockerfile.dev
├── database/
│   ├── init/
│   │   └── init.sql
│   └── data/
└── nginx/
    ├── nginx.conf
    └── Dockerfile
```

### Core Configuration Files:

#### 1. Directory.Build.props (Solution Root)
```xml
<Project>
    <PropertyGroup>
        <TargetFramework>net9.0</TargetFramework>
        <ImplicitUsings>enable</ImplicitUsings>
        <Nullable>enable</Nullable>
        <AnalysisLevel>latest</AnalysisLevel>
        <AnalysisMode>All</AnalysisMode>
        <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
        <CodeAnalysisTreatWarningsAsErrors>true</CodeAnalysisTreatWarningsAsErrors>
        <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
    </PropertyGroup>

    <ItemGroup Condition="'$(MSBuildProjectExtension)' != '.dcproj'">
        <PackageReference Include="SonarAnalyzer.CSharp">
            <PrivateAssets>all</PrivateAssets>
            <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
        </PackageReference>
    </ItemGroup>
</Project>
```

#### 2. Directory.Packages.props (Solution Root)
```xml
<Project>
    <PropertyGroup>
        <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
    </PropertyGroup>
    <ItemGroup>
        <!-- ASP.NET Core & EF Core -->
        <PackageVersion Include="Microsoft.AspNetCore.OpenApi" Version="9.0.4" />
        <PackageVersion Include="Microsoft.AspNetCore.JsonPatch" Version="9.0.8" />
        <PackageVersion Include="Microsoft.AspNetCore.Mvc.NewtonsoftJson" Version="9.0.8" />
        <PackageVersion Include="Microsoft.EntityFrameworkCore.Tools" Version="9.0.8" />
        <PackageVersion Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.4" />
        <PackageVersion Include="EFCore.NamingConventions" Version="9.0.0" />
        
        <!-- Authentication & Authorization -->
        <PackageVersion Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.4" />
        <PackageVersion Include="System.IdentityModel.Tokens.Jwt" Version="8.1.1" />
        
        <!-- Validation & Mapping -->
        <PackageVersion Include="FluentValidation.DependencyInjectionExtensions" Version="12.0.0" />
        <PackageVersion Include="AutoMapper" Version="13.0.1" />
        <PackageVersion Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="13.0.1" />
        
        <!-- OpenTelemetry & Monitoring -->
        <PackageVersion Include="OpenTelemetry.Exporter.OpenTelemetryProtocol" Version="1.12.0" />
        <PackageVersion Include="OpenTelemetry.Extensions.Hosting" Version="1.12.0" />
        <PackageVersion Include="OpenTelemetry.Instrumentation.AspNetCore" Version="1.12.0" />
        <PackageVersion Include="OpenTelemetry.Instrumentation.Http" Version="1.12.0" />
        <PackageVersion Include="OpenTelemetry.Instrumentation.Runtime" Version="1.12.0" />
        <PackageVersion Include="Npgsql.OpenTelemetry" Version="9.0.3" />
        
        <!-- Logging -->
        <PackageVersion Include="Serilog.AspNetCore" Version="8.0.0" />
        <PackageVersion Include="Serilog.Sinks.Console" Version="6.0.0" />
        <PackageVersion Include="Serilog.Sinks.File" Version="6.0.0" />
        <PackageVersion Include="Serilog.Sinks.PostgreSQL" Version="2.3.0" />
        
        <!-- Docker & Containers -->
        <PackageVersion Include="Microsoft.VisualStudio.Azure.Containers.Tools.Targets" Version="1.21.0" />
        
        <!-- Code Analysis -->
        <PackageVersion Include="SonarAnalyzer.CSharp" Version="10.15.0.120848" />
        
        <!-- Caching & Performance -->
        <PackageVersion Include="Microsoft.Extensions.Caching.StackExchangeRedis" Version="9.0.4" />
        
        <!-- Documentation -->
        <PackageVersion Include="Swashbuckle.AspNetCore" Version="7.0.0" />
        <PackageVersion Include="Swashbuckle.AspNetCore.Annotations" Version="7.0.0" />
    </ItemGroup>
</Project>
```

#### 3. ERP.API.csproj (Main API Project)
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
    <PropertyGroup>
        <UserSecretsId>erp-system-api-secrets-12345</UserSecretsId>
        <DockerDefaultTargetOS>Linux</DockerDefaultTargetOS>
        <DockerComposeProjectPath>..\docker-compose.dcproj</DockerComposeProjectPath>
    </PropertyGroup>

    <ItemGroup>
        <!-- ASP.NET Core & EF Core -->
        <PackageReference Include="Microsoft.AspNetCore.OpenApi" />
        <PackageReference Include="Microsoft.AspNetCore.JsonPatch" />
        <PackageReference Include="Microsoft.AspNetCore.Mvc.NewtonsoftJson" />
        <PackageReference Include="Microsoft.EntityFrameworkCore.Tools">
            <PrivateAssets>all</PrivateAssets>
            <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
        </PackageReference>
        <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" />
        <PackageReference Include="EFCore.NamingConventions" />
        
        <!-- Authentication -->
        <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" />
        <PackageReference Include="System.IdentityModel.Tokens.Jwt" />
        
        <!-- Validation & Mapping -->
        <PackageReference Include="FluentValidation.DependencyInjectionExtensions" />
        <PackageReference Include="AutoMapper" />
        <PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" />
        
        <!-- OpenTelemetry -->
        <PackageReference Include="OpenTelemetry.Exporter.OpenTelemetryProtocol" />
        <PackageReference Include="OpenTelemetry.Extensions.Hosting" />
        <PackageReference Include="OpenTelemetry.Instrumentation.AspNetCore" />
        <PackageReference Include="OpenTelemetry.Instrumentation.Http" />
        <PackageReference Include="OpenTelemetry.Instrumentation.Runtime" />
        <PackageReference Include="Npgsql.OpenTelemetry" />
        
        <!-- Logging -->
        <PackageReference Include="Serilog.AspNetCore" />
        <PackageReference Include="Serilog.Sinks.Console" />
        <PackageReference Include="Serilog.Sinks.File" />
        <PackageReference Include="Serilog.Sinks.PostgreSQL" />
        
        <!-- Caching -->
        <PackageReference Include="Microsoft.Extensions.Caching.StackExchangeRedis" />
        
        <!-- Documentation -->
        <PackageReference Include="Swashbuckle.AspNetCore" />
        <PackageReference Include="Swashbuckle.AspNetCore.Annotations" />
        
        <!-- Docker -->
        <PackageReference Include="Microsoft.VisualStudio.Azure.Containers.Tools.Targets" />
    </ItemGroup>
</Project>
```

---

## 📊 DATABASE ANALYSIS (Based on Your Schema)

### Core Database Entities:
1. **User Management**: JWT Authentication with refresh tokens
2. **Customer Management**: Customer data and relationships  
3. **Product Management**: Products, categories, inventory tracking
4. **Sales Management**: Orders, order details, payment processing
5. **Inventory Management**: Stock tracking, transactions, reorder alerts

### Your Current Database Schema Strengths:
- ✅ Proper foreign key relationships
- ✅ JWT refresh token support  
- ✅ Role-based access control (Admin, Sales, InventoryManager)
- ✅ Audit trails with timestamps
- ✅ Inventory transaction logging
- ✅ Calculated fields for totals

### Recommended Database Enhancements:
```sql
-- Add missing tables for a complete ERP
CREATE TABLE "Supplier" (
    "SupplierID" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(100),
    "Phone" VARCHAR(20),
    "Address" VARCHAR(255),
    "ContactPerson" VARCHAR(100),
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "PurchaseOrder" (
    "PurchaseID" SERIAL PRIMARY KEY,
    "SupplierID" INT REFERENCES "Supplier"("SupplierID"),
    "UserID" INT REFERENCES "User"("UserID"),
    "OrderDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Status" VARCHAR(50) CHECK ("Status" IN ('Pending', 'Received', 'Cancelled')),
    "TotalAmount" DECIMAL(12,2),
    "Notes" VARCHAR(255)
);

CREATE TABLE "PurchaseOrderDetail" (
    "PurchaseDetailID" SERIAL PRIMARY KEY,
    "PurchaseID" INT REFERENCES "PurchaseOrder"("PurchaseID") ON DELETE CASCADE,
    "ProductID" INT REFERENCES "Product"("ProductID") ON DELETE CASCADE,
    "Quantity" INT NOT NULL,
    "UnitPrice" DECIMAL(10,2) NOT NULL,
    "Total" DECIMAL(12,2) GENERATED ALWAYS AS ("Quantity" * "UnitPrice") STORED
);

CREATE TABLE "Report" (
    "ReportID" SERIAL PRIMARY KEY,
    "ReportType" VARCHAR(50),
    "GeneratedBy" INT REFERENCES "User"("UserID"),
    "GeneratedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Parameters" TEXT,
    "FilePath" VARCHAR(500)
);
```

---

## 🐳 MODERN DOCKER ARCHITECTURE (Updated for .NET 9.0)

### Multi-Stage Dockerfile (src/ERP.API/Dockerfile):
```dockerfile
# Fast mode for VS debugging
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy centralized package management files first for better layer caching
COPY ["Directory.Packages.props", "."]
COPY ["Directory.Build.props", "."]
COPY ["src/ERP.API/ERP.API.csproj", "src/ERP.API/"]
COPY ["src/ERP.Shared/ERP.Shared.csproj", "src/ERP.Shared/"]

# Restore packages
RUN dotnet restore "src/ERP.API/ERP.API.csproj"

# Copy source code
COPY . .
WORKDIR "/src/src/ERP.API"

# Build the application
RUN dotnet build "ERP.API.csproj" -c $BUILD_CONFIGURATION -o /app/build --no-restore

# Publish stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "ERP.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false --no-restore

# Final production stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "ERP.API.dll"]
```

### Development Dockerfile (src/ERP.API/Dockerfile.dev):
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy project files and restore
COPY ["Directory.Packages.props", "."]
COPY ["Directory.Build.props", "."]
COPY ["src/ERP.API/ERP.API.csproj", "src/ERP.API/"]
COPY ["src/ERP.Shared/ERP.Shared.csproj", "src/ERP.Shared/"]

RUN dotnet restore "src/ERP.API/ERP.API.csproj"

# Copy source and build
COPY . .
WORKDIR /app/src/ERP.API

# Use dotnet watch for hot reload in development
CMD ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:8080"]
```

### Production docker-compose.yml:
```yaml
version: '3.8'

services:
  # ASP.NET Core API
  erp-api:
    image: ${DOCKER_REGISTRY-}erp-api
    build:
      context: .
      dockerfile: src/ERP.API/Dockerfile
    container_name: erp-api
    ports:
      - "5000:8080"
      - "5001:8081"
    environment:
      # Connection Strings
      - ConnectionStrings__DefaultConnection=Host=erp-postgres;Database=${DB_NAME:-erp_system};Username=${DB_USER:-postgres};Password=${DB_PASSWORD:-postgres123}
      - ConnectionStrings__Redis=erp-redis:6379
      
      # JWT Configuration
      - JWT__Secret=${JWT_SECRET}
      - JWT__Issuer=${JWT_ISSUER:-ERPSystem}
      - JWT__Audience=${JWT_AUDIENCE:-ERPUsers}
      - JWT__ExpiryMinutes=${JWT_EXPIRY_MINUTES:-60}
      
      # OpenTelemetry
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://erp-aspire-dashboard:18889
      - OTEL_EXPORTER_OTLP_PROTOCOL=grpc
      - OTEL_SERVICE_NAME=ERP.API
      
      # Logging
      - Serilog__MinimumLevel__Default=Information
      - Serilog__MinimumLevel__Override__Microsoft=Warning
      - Serilog__MinimumLevel__Override__System=Warning
    depends_on:
      erp-postgres:
        condition: service_healthy
      erp-redis:
        condition: service_healthy
    networks:
      - erp-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # PostgreSQL Database
  erp-postgres:
    image: postgres:17.2
    container_name: erp-postgres
    environment:
      POSTGRES_DB: ${DB_NAME:-erp_system}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres123}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=en_US.UTF-8"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - erp-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-erp_system}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  erp-redis:
    image: redis:7.4-alpine
    container_name: erp-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - erp-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # pgAdmin
  erp-pgadmin:
    image: dpage/pgadmin4:latest
    container_name: erp-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD:-admin123}
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    ports:
      - "6060:80"
    depends_on:
      erp-postgres:
        condition: service_healthy
    networks:
      - erp-network
    restart: unless-stopped
    volumes:
      - pgadmin_data:/var/lib/pgadmin

  # Aspire Dashboard for Monitoring
  erp-aspire-dashboard:
    image: mcr.microsoft.com/dotnet/aspire-dashboard:9.0
    container_name: erp-aspire-dashboard
    environment:
      DOTNET_DASHBOARD_UNSECURED_ALLOW_ANONYMOUS: 'true'
    ports:
      - "18888:18888"
      - "18889:18889"
    networks:
      - erp-network
    restart: unless-stopped

  # React Frontend
  erp-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: erp-frontend
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
      - REACT_APP_ENVIRONMENT=production
    ports:
      - "3000:80"
    depends_on:
      erp-api:
        condition: service_healthy
    networks:
      - erp-network
    restart: unless-stopped

  # Nginx Reverse Proxy (Optional)
  erp-nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: erp-nginx
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - erp-api
      - erp-frontend
    networks:
      - erp-network
    restart: unless-stopped
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro

volumes:
  postgres_data:
  redis_data:
  pgadmin_data:

networks:
  erp-network:
    driver: bridge
```

### Development docker-compose.dev.yml:
```yaml
version: '3.8'

services:
  # ASP.NET Core API (Development)
  erp-api-dev:
    build:
      context: .
      dockerfile: src/ERP.API/Dockerfile.dev
    container_name: erp-api-dev
    ports:
      - "5001:8080"
      - "5002:8081"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Host=erp-postgres-dev;Database=erp_system_dev;Username=postgres;Password=postgres123
      - ConnectionStrings__Redis=erp-redis-dev:6379
      - JWT__Secret=development-jwt-secret-key-not-for-production-use-minimum-32-characters
      - JWT__Issuer=ERPSystem
      - JWT__Audience=ERPUsers
      - JWT__ExpiryMinutes=1440
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://erp-aspire-dashboard-dev:18889
      - OTEL_EXPORTER_OTLP_PROTOCOL=grpc
      - OTEL_SERVICE_NAME=ERP.API.Dev
    volumes:
      - ./src:/app/src:cached
      - /app/src/ERP.API/bin
      - /app/src/ERP.API/obj
    depends_on:
      erp-postgres-dev:
        condition: service_healthy
    networks:
      - erp-dev-network
    restart: unless-stopped

  # PostgreSQL (Development)
  erp-postgres-dev:
    image: postgres:17.2
    container_name: erp-postgres-dev
    environment:
      POSTGRES_DB: erp_system_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5433:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - erp-dev-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d erp_system_dev"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis (Development)
  erp-redis-dev:
    image: redis:7.4-alpine
    container_name: erp-redis-dev
    ports:
      - "6380:6379"
    networks:
      - erp-dev-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # pgAdmin (Development)
  erp-pgadmin-dev:
    image: dpage/pgadmin4:latest
    container_name: erp-pgadmin-dev
    environment:
      PGADMIN_DEFAULT_EMAIL: dev@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "6061:80"
    depends_on:
      erp-postgres-dev:
        condition: service_healthy
    networks:
      - erp-dev-network

  # Aspire Dashboard (Development)
  erp-aspire-dashboard-dev:
    image: mcr.microsoft.com/dotnet/aspire-dashboard:9.0
    container_name: erp-aspire-dashboard-dev
    environment:
      DOTNET_DASHBOARD_UNSECURED_ALLOW_ANONYMOUS: 'true'
    ports:
      - "18890:18888"
      - "18891:18889"
    networks:
      - erp-dev-network

  # React Frontend (Development)
  erp-frontend-dev:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: erp-frontend-dev
    environment:
      - REACT_APP_API_URL=http://localhost:5001/api
      - REACT_APP_ENVIRONMENT=development
    ports:
      - "3001:3000"
    volumes:
      - ./frontend:/app:cached
      - /app/node_modules
    depends_on:
      - erp-api-dev
    networks:
      - erp-dev-network

volumes:
  postgres_dev_data:

networks:
  erp-dev-network:
    driver: bridge
```

### Complete Project Structure:
```
erp-system/
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env
├── .gitignore
├── README.md
├── backend/
│   ├── ERP.API/
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs
│   │   │   ├── UsersController.cs
│   │   │   ├── CustomersController.cs
│   │   │   ├── ProductsController.cs
│   │   │   ├── CategoriesController.cs
│   │   │   ├── SalesOrdersController.cs
│   │   │   ├── InventoryController.cs
│   │   │   ├── SuppliersController.cs
│   │   │   ├── PurchaseOrdersController.cs
│   │   │   └── ReportsController.cs
│   │   ├── Models/
│   │   │   ├── DTOs/
│   │   │   │   ├── Auth/
│   │   │   │   ├── User/
│   │   │   │   ├── Customer/
│   │   │   │   ├── Product/
│   │   │   │   ├── Order/
│   │   │   │   └── Inventory/
│   │   │   ├── Entities/
│   │   │   └── ViewModels/
│   │   ├── Services/
│   │   │   ├── Interfaces/
│   │   │   └── Implementations/
│   │   ├── Data/
│   │   │   ├── ErpDbContext.cs
│   │   │   ├── Repositories/
│   │   │   └── Migrations/
│   │   ├── Middleware/
│   │   ├── Utilities/
│   │   └── Program.cs
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # ShadCN components
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardStats.tsx
│   │   │   │   ├── SalesChart.tsx
│   │   │   │   └── RecentOrders.tsx
│   │   │   ├── customers/
│   │   │   │   ├── CustomerList.tsx
│   │   │   │   ├── CustomerForm.tsx
│   │   │   │   └── CustomerDetails.tsx
│   │   │   ├── products/
│   │   │   │   ├── ProductList.tsx
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   └── CategoryManager.tsx
│   │   │   ├── orders/
│   │   │   │   ├── OrderList.tsx
│   │   │   │   ├── OrderForm.tsx
│   │   │   │   └── OrderDetails.tsx
│   │   │   ├── inventory/
│   │   │   │   ├── InventoryDashboard.tsx
│   │   │   │   ├── StockAdjustment.tsx
│   │   │   │   └── TransactionHistory.tsx
│   │   │   └── theme/
│   │   │       ├── ThemeProvider.tsx
│   │   │       └── ThemeToggle.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── CustomersPage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── OrdersPage.tsx
│   │   │   └── InventoryPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── customerService.ts
│   │   │   ├── productService.ts
│   │   │   └── orderService.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useCustomers.ts
│   │   │   └── useProducts.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   ├── helpers.ts
│   │   │   └── validators.ts
│   │   ├── styles/
│   │   │   └── globals.css
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── .dockerignore
├── database/
│   ├── init/
│   │   └── init.sql
│   └── data/
└── nginx/
    ├── nginx.conf
    └── Dockerfile
```

---

## 🏗️ BACKEND ARCHITECTURE (ASP.NET Core)

### Modern Program.cs Configuration (.NET 9.0):
```csharp
using ERP.API.Extensions;
using ERP.API.Middleware;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

// Add services to the container
builder.Services.AddControllers()
    .AddNewtonsoftJson()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.SuppressModelStateInvalidFilter = false;
    });

// Database configuration
builder.Services.AddDbContext<ErpDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .UseSnakeCaseNamingConvention();
});

// Redis Cache
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

// JWT Authentication
builder.Services.AddJwtAuthentication(builder.Configuration);

// Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("InventoryManager", policy => policy.RequireRole("Admin", "InventoryManager"));
    options.AddPolicy("SalesTeam", policy => policy.RequireRole("Admin", "Sales", "InventoryManager"));
});

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Application Services
builder.Services.AddApplicationServices();

// OpenAPI/Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.EnableAnnotations();
    options.AddJwtSecurityDefinition();
});

// OpenTelemetry
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddNpgsql()
        .AddOtlpExporter())
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddRuntimeInstrumentation()
        .AddOtlpExporter())
    .WithLogging(logging => logging
        .AddOtlpExporter());

// Health Checks
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!)
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ERP API V1");
        c.RoutePrefix = "swagger";
    });
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// Middleware pipeline
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// Custom middleware
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

// Health checks endpoint
app.MapHealthChecks("/health");

// Controllers
app.MapControllers();

// Database migration and seeding
await app.Services.SeedDatabaseAsync();

app.Run();
```

### Service Registration Extensions:
```csharp
// Extensions/ServiceCollectionExtensions.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace ERP.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("JWT");
        var secretKey = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT Secret is missing");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                ValidateIssuer = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidateAudience = true,
                ValidAudience = jwtSettings["Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register application services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<ISalesOrderService, SalesOrderService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<ISupplierService, SupplierService>();
        services.AddScoped<IPurchaseOrderService, PurchaseOrderService>();
        services.AddScoped<IReportService, ReportService>();
        
        // Register repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<ISalesOrderRepository, SalesOrderRepository>();
        services.AddScoped<IInventoryRepository, InventoryRepository>();
        services.AddScoped<ISupplierRepository, SupplierRepository>();
        services.AddScoped<IPurchaseOrderRepository, PurchaseOrderRepository>();

        return services;
    }

    public static void AddJwtSecurityDefinition(this SwaggerGenOptions options)
    {
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme (Example: 'Bearer 12345abcdef')",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    }
}
```

### Global Exception Middleware:
```csharp
// Middleware/GlobalExceptionMiddleware.cs
using System.Net;
using System.Text.Json;

namespace ERP.API.Middleware;

public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = context.Response;
        response.ContentType = "application/json";

        var errorResponse = new
        {
            message = exception.Message,
            statusCode = (int)HttpStatusCode.InternalServerError
        };

        response.StatusCode = exception switch
        {
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            ArgumentException => (int)HttpStatusCode.BadRequest,
            _ => (int)HttpStatusCode.InternalServerError
        };

        errorResponse = errorResponse with { statusCode = response.StatusCode };

        var jsonResponse = JsonSerializer.Serialize(errorResponse);
        await response.WriteAsync(jsonResponse);
    }
}
```

### Core API Controllers & Complete Endpoints:

#### 1. AuthController
```csharp
[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)

    // POST /api/auth/refresh-token
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto tokenDto)

    // POST /api/auth/logout
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()

    // GET /api/auth/me
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()

    // POST /api/auth/change-password
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
}
```

#### 2. UsersController
```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UsersController : ControllerBase
{
    // GET /api/users
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers([FromQuery] PaginationDto pagination)

    // GET /api/users/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)

    // POST /api/users
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto userDto)

    // PUT /api/users/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto userDto)

    // DELETE /api/users/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(int id)

    // PATCH /api/users/{id}/status
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleUserStatus(int id)
}
```

#### 3. CustomersController
```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CustomersController : ControllerBase
{
    // GET /api/customers
    [HttpGet]
    public async Task<IActionResult> GetCustomers([FromQuery] CustomerFilterDto filter)

    // GET /api/customers/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCustomer(int id)

    // POST /api/customers
    [HttpPost]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerDto customerDto)

    // PUT /api/customers/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCustomer(int id, [FromBody] UpdateCustomerDto customerDto)

    // DELETE /api/customers/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCustomer(int id)

    // GET /api/customers/{id}/orders
    [HttpGet("{id}/orders")]
    public async Task<IActionResult> GetCustomerOrders(int id, [FromQuery] PaginationDto pagination)

    // GET /api/customers/search
    [HttpGet("search")]
    public async Task<IActionResult> SearchCustomers([FromQuery] string query)
}
```

#### 4. ProductsController
```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProductsController : ControllerBase
{
    // GET /api/products
    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] ProductFilterDto filter)

    // GET /api/products/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id)

    // POST /api/products
    [HttpPost]
    [Authorize(Roles = "Admin,InventoryManager")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto productDto)

    // PUT /api/products/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,InventoryManager")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto productDto)

    // DELETE /api/products/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProduct(int id)

    // GET /api/products/low-stock
    [HttpGet("low-stock")]
    [Authorize(Roles = "Admin,InventoryManager")]
    public async Task<IActionResult> GetLowStockProducts()

    // PATCH /api/products/{id}/stock
    [HttpPatch("{id}/stock")]
    [Authorize(Roles = "Admin,InventoryManager")]
    public async Task<IActionResult> AdjustStock(int id, [FromBody] StockAdjustmentDto adjustment)

    // GET /api/products/search
    [HttpGet("search")]
    public async Task<IActionResult> SearchProducts([FromQuery] string query)
}
```

#### 5. CategoriesController
```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CategoriesController : ControllerBase
{
    // GET /api/categories
    [HttpGet]
    public async Task<IActionResult> GetCategories()

    // GET /api/categories/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategory(int id)

    // POST /api/categories
    [HttpPost]
    [Authorize(Roles = "Admin,InventoryManager")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto categoryDto)

    // PUT /api/categories/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,InventoryManager")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDto categoryDto)

    // DELETE /api/categories/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCategory(int id)

    // GET /api/categories/{id}/products
    [HttpGet("{id}/products")]
    public async Task<IActionResult> GetCategoryProducts(int id)
}
```

#### 6. SalesOrdersController
```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class SalesOrdersController : ControllerBase
{
    // GET /api/salesorders
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] OrderFilterDto filter)

    // GET /api/salesorders/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)

    // POST /api/salesorders
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto orderDto)

    // PUT /api/salesorders/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOrder(int id, [FromBody] UpdateOrderDto orderDto)

    // PATCH /api/salesorders/{id}/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatusDto statusDto)

    // DELETE /api/salesorders/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteOrder(int id)

    // GET /api/salesorders/{id}/details
    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetOrderDetails(int id)

    // POST /api/salesorders/{id}/payment
    [HttpPost("{id}/payment")]
    public async Task<IActionResult> ProcessPayment(int id, [FromBody] PaymentDto paymentDto)
}
```

#### 7. InventoryController
```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,InventoryManager")]
public class InventoryController : ControllerBase
{
    // GET /api/inventory/transactions
    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions([FromQuery] TransactionFilterDto filter)

    // POST /api/inventory/adjustment
    [HttpPost("adjustment")]
    public async Task<IActionResult> CreateAdjustment([FromBody] InventoryAdjustmentDto adjustment)

    // GET /api/inventory/reports
    [HttpGet("reports")]
    public async Task<IActionResult> GetInventoryReports([FromQuery] ReportFilterDto filter)

    // GET /api/inventory/alerts
    [HttpGet("alerts")]
    public async Task<IActionResult> GetInventoryAlerts()

    // GET /api/inventory/summary
    [HttpGet("summary")]
    public async Task<IActionResult> GetInventorySummary()

    // POST /api/inventory/bulk-adjustment
    [HttpPost("bulk-adjustment")]
    public async Task<IActionResult> BulkAdjustment([FromBody] BulkAdjustmentDto bulkAdjustment)
}
```

#### 8. SuppliersController
```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class SuppliersController : ControllerBase
{
    // GET /api/suppliers
    [HttpGet]
    public async Task<IActionResult> GetSuppliers([FromQuery] PaginationDto pagination)

    // GET /api/suppliers/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSupplier(int id)

    // POST /api/suppliers
    [HttpPost]
    [Authorize(Roles = "Admin,InventoryManager")]
    public async Task<IActionResult> CreateSupplier([FromBody] CreateSupplierDto supplierDto)

    // PUT /api/suppliers/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,InventoryManager")]
    public async Task<IActionResult> UpdateSupplier(int id, [FromBody] UpdateSupplierDto supplierDto)

    // DELETE /api/suppliers/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSupplier(int id)

    // GET /api/suppliers/{id}/purchases
    [HttpGet("{id}/purchases")]
    public async Task<IActionResult> GetSupplierPurchases(int id)
}
```

#### 9. PurchaseOrdersController
```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,InventoryManager")]
public class PurchaseOrdersController : ControllerBase
{
    // GET /api/purchaseorders
    [HttpGet]
    public async Task<IActionResult> GetPurchaseOrders([FromQuery] PurchaseOrderFilterDto filter)

    // GET /api/purchaseorders/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPurchaseOrder(int id)

    // POST /api/purchaseorders
    [HttpPost]
    public async Task<IActionResult> CreatePurchaseOrder([FromBody] CreatePurchaseOrderDto purchaseOrderDto)

    // PUT /api/purchaseorders/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePurchaseOrder(int id, [FromBody] UpdatePurchaseOrderDto purchaseOrderDto)

    // PATCH /api/purchaseorders/{id}/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdatePurchaseOrderStatus(int id, [FromBody] PurchaseOrderStatusDto statusDto)

    // POST /api/purchaseorders/{id}/receive
    [HttpPost("{id}/receive")]
    public async Task<IActionResult> ReceivePurchaseOrder(int id, [FromBody] ReceivePurchaseOrderDto receiveDto)
}
```

#### 10. ReportsController
```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ReportsController : ControllerBase
{
    // GET /api/reports/sales
    [HttpGet("sales")]
    public async Task<IActionResult> GetSalesReport([FromQuery] SalesReportDto reportDto)

    // GET /api/reports/inventory
    [HttpGet("inventory")]
    [Authorize(Roles = "Admin,InventoryManager")]
    public async Task<IActionResult> GetInventoryReport([FromQuery] InventoryReportDto reportDto)

    // GET /api/reports/customers
    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomerReport([FromQuery] CustomerReportDto reportDto)

    // GET /api/reports/products
    [HttpGet("products")]
    public async Task<IActionResult> GetProductReport([FromQuery] ProductReportDto reportDto)

    // GET /api/reports/dashboard
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardData([FromQuery] DateRangeDto dateRange)

    // POST /api/reports/export
    [HttpPost("export")]
    public async Task<IActionResult> ExportReport([FromBody] ExportReportDto exportDto)
}
```

---

## 🐋 DOCKER CONFIGURATION

### 1. Production docker-compose.yml
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: erp-postgres
    environment:
      POSTGRES_DB: ${DB_NAME:-erp_system}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres123}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - erp-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ASP.NET Core API
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: erp-api
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=${DB_NAME:-erp_system};Username=${DB_USER:-postgres};Password=${DB_PASSWORD:-postgres123}
      - JWT__Secret=${JWT_SECRET}
      - JWT__Issuer=${JWT_ISSUER:-ERPSystem}
      - JWT__Audience=${JWT_AUDIENCE:-ERPUsers}
      - JWT__ExpiryMinutes=${JWT_EXPIRY_MINUTES:-60}
    ports:
      - "5000:80"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - erp-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # React Frontend with ShadCN
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: erp-frontend
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
      - REACT_APP_ENVIRONMENT=production
    ports:
      - "3000:80"
    depends_on:
      api:
        condition: service_healthy
    networks:
      - erp-network
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: erp-nginx
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - api
      - frontend
    networks:
      - erp-network
    restart: unless-stopped
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro

volumes:
  postgres_data:

networks:
  erp-network:
    driver: bridge
```

### 2. Development docker-compose.dev.yml
```yaml
version: '3.8'

services:
  postgres-dev:
    image: postgres:15-alpine
    container_name: erp-postgres-dev
    environment:
      POSTGRES_DB: erp_system_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5433:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - erp-dev-network

  api-dev:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: erp-api-dev
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Host=postgres-dev;Database=erp_system_dev;Username=postgres;Password=postgres123
      - JWT__Secret=your-super-secret-jwt-key-for-development-only
      - JWT__Issuer=ERPSystem
      - JWT__Audience=ERPUsers
      - JWT__ExpiryMinutes=1440
    ports:
      - "5001:80"
    volumes:
      - ./backend:/app
      - /app/bin
      - /app/obj
    depends_on:
      - postgres-dev
    networks:
      - erp-dev-network

  frontend-dev:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: erp-frontend-dev
    environment:
      - REACT_APP_API_URL=http://localhost:5001/api
      - REACT_APP_ENVIRONMENT=development
    ports:
      - "3001:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - api-dev
    networks:
      - erp-dev-network

volumes:
  postgres_dev_data:

networks:
  erp-dev-network:
    driver: bridge
```

---

## 🎨 FRONTEND ARCHITECTURE (React.js + ShadCN/UI)

### Complete Frontend Package.json
```json
{
  "name": "erp-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    "axios": "^1.5.0",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "react-query": "^3.39.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-switch": "^1.0.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.290.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7",
    "date-fns": "^2.30.0",
    "recharts": "^2.8.0",
    "react-datepicker": "^4.21.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.1.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^4.5.0"
  }
}
```

### Core React Components:

#### Main App Component
```tsx
// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider } from './components/theme/theme-provider'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from './components/ui/toaster'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CustomersPage from './pages/CustomersPage'
import ProductsPage from './pages/ProductsPage'
import OrdersPage from './pages/OrdersPage'
import InventoryPage from './pages/InventoryPage'
import SuppliersPage from './pages/SuppliersPage'
import PurchaseOrdersPage from './pages/PurchaseOrdersPage'
import ReportsPage from './pages/ReportsPage'
import UsersPage from './pages/UsersPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="erp-ui-theme">
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<DashboardPage />} />
                          <Route path="/customers" element={<CustomersPage />} />
                          <Route path="/products" element={<ProductsPage />} />
                          <Route path="/orders" element={<OrdersPage />} />
                          <Route path="/inventory" element={<InventoryPage />} />
                          <Route path="/suppliers" element={<SuppliersPage />} />
                          <Route path="/purchases" element={<PurchaseOrdersPage />} />
                          <Route path="/reports" element={<ReportsPage />} />
                          <Route path="/users" element={<UsersPage />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
```

### ShadCN/UI Configuration Files:

#### Tailwind Config with Dark Mode
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## 🎯 CORE FEATURES BY MODULE

### 1. Authentication & Authorization ✅
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Sales, InventoryManager)
- Password hashing and validation
- Session management and logout
- Remember me functionality

### 2. User Management (Admin Only) ✅
- Create/Edit/Delete users
- Role assignment and permissions
- User activity tracking and audit logs
- Account activation/deactivation
- Password reset functionality

### 3. Customer Management ✅
- Complete CRUD operations
- Advanced search and filtering
- Customer order history and analytics
- Customer contact and company info
- Tax number and billing details

### 4. Product Management ✅
- Product catalog with rich details
- Category organization and hierarchy
- SKU generation and management
- Pricing and cost tracking
- Stock level monitoring
- Product images and descriptions

### 5. Sales Management ✅
- Order creation and processing
- Multi-status order tracking (Pending, Paid, Shipped, Cancelled)
- Multiple payment methods support
- Order history and advanced search
- Customer order lookup and analytics
- Invoice generation and printing

### 6. Inventory Management ✅
- Real-time stock tracking
- Comprehensive transaction logging
- Stock adjustments with reasons
- Reorder level management and alerts
- Inventory valuation reports
- Bulk stock operations

### 7. Purchase Management (New) ✅
- Supplier management
- Purchase order creation and tracking
- Receiving goods and stock updates
- Supplier performance analytics
- Purchase history and reporting

### 8. Reporting & Analytics ✅
- Sales reports (daily/monthly/yearly)
- Inventory valuation and movement reports
- Customer analysis and segmentation
- Product performance metrics
- Revenue and profit analytics
- Export to PDF/Excel formats

### 9. Dashboard & Insights ✅
- Real-time business metrics
- Sales trends and forecasting
- Inventory alerts and notifications
- Quick action shortcuts
- Performance indicators (KPIs)
- Visual charts and graphs

---

## 🔧 MODERN DEVELOPMENT WORKFLOW

### Code Quality & Analysis Setup:
```xml
<!-- .editorconfig (Solution Root) -->
root = true

[*]
charset = utf-8
end_of_line = crlf
indent_style = space
indent_size = 4
insert_final_newline = true
trim_trailing_whitespace = true

[*.{cs,vb}]
dotnet_analyzer_diagnostic.category-style.severity = error
dotnet_analyzer_diagnostic.category-design.severity = warning
dotnet_analyzer_diagnostic.category-maintainability.severity = warning
dotnet_analyzer_diagnostic.category-performance.severity = warning
dotnet_analyzer_diagnostic.category-reliability.severity = error
dotnet_analyzer_diagnostic.category-security.severity = error

# C# formatting rules
csharp_new_line_before_open_brace = all
csharp_new_line_before_else = true
csharp_new_line_before_catch = true
csharp_new_line_before_finally = true
csharp_indent_case_contents = true
csharp_indent_switch_labels = true

[*.{js,ts,tsx,json}]
indent_size = 2
```

### Environment Configuration:
```env
# .env (Production)
# Database Configuration
DB_NAME=erp_system
DB_USER=postgres
DB_PASSWORD=your-super-secure-password-change-this

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-minimum-64-characters-change-this-in-production-12345
JWT_ISSUER=ERPSystem
JWT_AUDIENCE=ERPUsers
JWT_EXPIRY_MINUTES=60

# Redis Configuration
REDIS_CONNECTION_STRING=erp-redis:6379

# OpenTelemetry
OTEL_SERVICE_NAME=ERP.API
OTEL_EXPORTER_OTLP_ENDPOINT=http://erp-aspire-dashboard:18889

# pgAdmin
PGADMIN_PASSWORD=your-secure-admin-password

# Application Settings
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:8080;https://0.0.0.0:8081
```

```env
# .env.dev (Development)
# Database Configuration
DB_NAME=erp_system_dev
DB_USER=postgres
DB_PASSWORD=postgres123

# JWT Configuration (Development Only)
JWT_SECRET=development-jwt-secret-key-not-for-production-use-minimum-64-characters
JWT_ISSUER=ERPSystem
JWT_AUDIENCE=ERPUsers
JWT_EXPIRY_MINUTES=1440

# Application Settings
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://0.0.0.0:8080;https://0.0.0.0:8081
```

### Enhanced appsettings.json:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "",
    "Redis": ""
  },
  "JWT": {
    "Secret": "",
    "Issuer": "ERPSystem", 
    "Audience": "ERPUsers",
    "ExpiryMinutes": 60
  },
  "Serilog": {
    "Using": ["Serilog.Sinks.Console", "Serilog.Sinks.File"],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "outputTemplate": "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/erp-api-.log",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 7,
          "outputTemplate": "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
        }
      }
    ],
    "Enrich": ["FromLogContext", "WithMachineName", "WithThreadId"]
  },
  "OpenTelemetry": {
    "ServiceName": "ERP.API",
    "ServiceVersion": "1.0.0"
  },
  "AllowedHosts": "*"
}
```

### Enhanced .gitignore:
```gitignore
## Ignore Visual Studio temporary files, build results, and
## files generated by popular Visual Studio add-ons.

# User-specific files
*.rsuser
*.suo
*.user
*.userosscache
*.sln.docstates

# Build results
[Dd]ebug/
[Dd]ebugPublic/
[Rr]elease/
[Rr]eleases/
x64/
x86/
[Ww][Ii][Nn]32/
[Aa][Rr][Mm]/
[Aa][Rr][Mm]64/
bld/
[Bb]in/
[Oo]bj/
[Ll]og/
[Ll]ogs/

# Visual Studio 2015/2017 cache/options directory
.vs/

# MSTest test Results
[Tt]est[Rr]esult*/
[Bb]uild[Ll]og.*

# .NET Core
project.lock.json
project.fragment.lock.json
artifacts/

# Logs
logs/
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Docker
.containers/
*.dcproj.user

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Frontend
frontend/node_modules/
frontend/build/
frontend/dist/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

---

## 📋 IMPLEMENTATION PHASES (12-Week Plan - Updated for .NET 9.0)

### Phase 1: Modern Foundation Setup (Week 1-2)
**Project Structure & Configuration**
- [ ] Create solution with `src` folder organization
- [ ] Setup Directory.Build.props and Directory.Packages.props
- [ ] Configure .NET 9.0 with latest C# features
- [ ] Enable centralized package management
- [ ] Setup code analysis and quality enforcement

**Docker & Infrastructure (Modern)**
- [ ] Multi-stage Dockerfiles for API and Frontend
- [ ] Production and development docker-compose files
- [ ] PostgreSQL 17.2 with proper health checks
- [ ] Redis cache integration
- [ ] Aspire Dashboard for monitoring

**OpenTelemetry & Observability**
- [ ] Configure OpenTelemetry with OTLP exporter
- [ ] Setup distributed tracing
- [ ] Metrics collection and monitoring
- [ ] Structured logging with Serilog

### Phase 2: Enhanced Backend Architecture (Week 3-4)
**Modern API Foundation**
- [ ] Configure Program.cs with minimal APIs approach
- [ ] JWT authentication with proper security
- [ ] Global exception handling middleware
- [ ] Request logging and correlation IDs
- [ ] Health checks for all dependencies

**Entity Framework & Database**
- [ ] Setup DbContext with snake_case naming
- [ ] Implement repository pattern with generics
- [ ] Configure database migrations
- [ ] Add connection pooling and performance optimization
- [ ] Setup database seeding and test data

**Core Services & Authentication**
- [ ] Implement JWT service with refresh tokens
- [ ] User management with role-based access
- [ ] Password hashing and validation
- [ ] Session management and audit logging

### Phase 3: Business Domain APIs (Week 5-6)
**Customer & Product Management**
- [ ] Complete CRUD operations with DTOs
- [ ] Advanced filtering and pagination
- [ ] Input validation with FluentValidation
- [ ] AutoMapper for entity-DTO mapping
- [ ] Caching with Redis integration

**Inventory & Stock Management**
- [ ] Real-time inventory tracking
- [ ] Transaction logging and audit trails
- [ ] Stock adjustment workflows
- [ ] Low stock alerts and notifications
- [ ] Bulk operations support

### Phase 4: Advanced Business Logic (Week 7-8)
**Sales Order System**
- [ ] Order creation with business rules
- [ ] Multi-status workflow management
- [ ] Payment processing integration
- [ ] Invoice generation (PDF)
- [ ] Order fulfillment tracking

**Purchase Order Management**
- [ ] Supplier management system
- [ ] Purchase order workflows
- [ ] Goods receiving processes
- [ ] Supplier performance tracking
- [ ] Purchase analytics and reporting

### Phase 5: Modern Frontend Architecture (Week 9-10)
**React + ShadCN/UI Setup**
- [ ] Vite configuration with TypeScript
- [ ] ShadCN/UI components with dark mode
- [ ] Tailwind CSS with custom theme
- [ ] React Router v6 with protected routes
- [ ] React Query for state management

**Authentication & Layout**
- [ ] JWT token management with auto-refresh
- [ ] Login/logout with proper error handling
- [ ] Responsive layout with sidebar navigation
- [ ] Theme provider and dark mode toggle
- [ ] Loading states and error boundaries

**Core Business UI Components**
- [ ] Customer management interface
- [ ] Product catalog with search/filter
- [ ] Order management workflows
- [ ] Inventory dashboard and controls
- [ ] Form validation with react-hook-form + Zod

### Phase 6: Advanced Frontend Features (Week 11-12)
**Data Visualization & Charts**
- [ ] Dashboard with real-time metrics
- [ ] Sales analytics with Recharts
- [ ] Inventory reports and charts
- [ ] Customer analytics dashboard
- [ ] Export functionality (PDF/Excel)

**Performance & UX Optimization**
- [ ] Code splitting and lazy loading
- [ ] Optimistic updates and caching
- [ ] Error handling and retry logic
- [ ] Mobile responsiveness
- [ ] Accessibility improvements (WCAG 2.1)

**Testing & Quality Assurance**
- [ ] Unit tests for critical business logic
- [ ] Integration tests for API endpoints
- [ ] Frontend component testing
- [ ] End-to-end testing setup
- [ ] Performance monitoring and optimization

### Phase 7: Production Readiness (Week 13)
**Security & Performance**
- [ ] Security headers and CORS configuration
- [ ] Rate limiting and throttling
- [ ] API versioning strategy
- [ ] Database query optimization
- [ ] Caching strategies implementation

**Deployment & DevOps**
- [ ] Production Docker configuration
- [ ] Environment-specific configurations
- [ ] Backup and recovery procedures
- [ ] Monitoring and alerting setup
- [ ] Documentation and deployment guide

---

## 🛠️ MODERN TECHNOLOGY STACK (Updated for 2024)

### Backend Stack (.NET 9.0):
- **Framework**: ASP.NET Core 9.0 with latest C# features
- **Target Framework**: .NET 9.0 with nullability and implicit usings
- **Database**: PostgreSQL 17.2 with advanced features
- **ORM**: Entity Framework Core 9.0 with snake_case naming
- **Authentication**: JWT Bearer tokens with refresh token rotation
- **API Documentation**: Swagger/OpenAPI 3.0 with annotations
- **Logging**: Serilog with structured logging and PostgreSQL sink
- **Validation**: FluentValidation with dependency injection
- **Caching**: Redis 7.4 for distributed caching and session storage
- **Monitoring**: OpenTelemetry with OTLP exporter
- **Code Quality**: SonarAnalyzer with strict analysis rules
- **Mapping**: AutoMapper for entity-DTO transformations

### Frontend Stack (Modern React):
- **Framework**: React 18 with TypeScript 5.2+
- **Build Tool**: Vite with fast HMR and optimized builds
- **UI Framework**: ShadCN/UI + Radix UI primitives
- **Styling**: Tailwind CSS 3.3+ with custom design system
- **State Management**: React Query v3 + Zustand for complex state
- **Routing**: React Router v6 with data loaders
- **HTTP Client**: Axios with interceptors and retry logic
- **Forms**: React Hook Form + Zod validation schemas
- **Charts**: Recharts with responsive design
- **Date Handling**: date-fns for lightweight date operations
- **Icons**: Lucide React (modern Feather icons)
- **Animation**: Tailwind CSS animations + Framer Motion

### DevOps & Infrastructure (Production-Ready):
- **Containerization**: Multi-stage Docker builds with optimization
- **Orchestration**: Docker Compose with health checks
- **Database**: PostgreSQL 17.2 with connection pooling
- **Cache**: Redis 7.4 with persistent storage
- **Reverse Proxy**: Nginx with SSL termination (optional)
- **Monitoring**: Aspire Dashboard for .NET applications
- **Observability**: OpenTelemetry with distributed tracing
- **Environment Management**: Centralized configuration with secrets
- **Development**: Hot reload, file watching, and debugging support
- **Production**: Optimized builds with security headers

### Development Tools & Quality:
- **IDE**: Visual Studio 2022 / Visual Studio Code with extensions
- **API Testing**: REST Client, Postman, or Thunder Client
- **Database Management**: pgAdmin 4 with Docker integration  
- **Version Control**: Git with GitFlow or GitHub Flow
- **Package Management**: Centralized with Directory.Packages.props
- **Code Analysis**: EditorConfig + SonarAnalyzer + Roslyn analyzers
- **Testing**: xUnit for backend, Vitest for frontend
- **Documentation**: OpenAPI spec with Swagger UI

### Security & Performance:
- **Authentication**: JWT with RSA256 or HMAC-SHA256
- **Authorization**: Role-based and policy-based access control
- **HTTPS**: TLS 1.3 with proper certificate management
- **CORS**: Configured for specific origins and methods
- **Rate Limiting**: Built-in ASP.NET Core rate limiting
- **Input Validation**: Multi-layer validation (client + server)
- **SQL Injection**: Protected by EF Core parameterized queries
- **XSS Protection**: Content Security Policy headers
- **Performance**: Response caching, compression, and CDN support

---

## 🚀 MODERN DEVELOPMENT COMMANDS

### Initial Project Setup:
```bash
# Create solution structure
mkdir erp-system && cd erp-system
mkdir src frontend database nginx

# Initialize .NET solution
dotnet new sln -n ERP.System

# Create API project with latest template
cd src
dotnet new webapi -n ERP.API --framework net9.0
dotnet sln ../ERP.System.sln add ERP.API/ERP.API.csproj

# Create shared library
dotnet new classlib -n ERP.Shared --framework net9.0
dotnet sln ../ERP.System.sln add ERP.Shared/ERP.Shared.csproj

# Add project reference
cd ERP.API
dotnet add reference ../ERP.Shared/ERP.Shared.csproj
```

### Development Environment:
```bash
# Clone and setup
git clone <your-repo>
cd erp-system

# Copy environment files
cp .env.dev.example .env.dev
cp .env.example .env

# Start development environment with build
docker-compose -f docker-compose.dev.yml up --build -d

# View logs (all services)
docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker-compose -f docker-compose.dev.yml logs -f erp-api-dev

# Access services:
# Frontend: http://localhost:3001
# Backend API: http://localhost:5001/swagger
# Database: localhost:5433 (postgres/postgres123)
# pgAdmin: http://localhost:6061 (dev@admin.com/admin123)
# Aspire Dashboard: http://localhost:18890
# Redis: localhost:6380
```

### Production Deployment:
```bash
# Production environment setup
cp .env.example .env
# Edit .env with production values

# Deploy with build
docker-compose up --build -d

# View production logs
docker-compose logs -f

# Access services:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/swagger
# Database: localhost:5432
# pgAdmin: http://localhost:6060
# Aspire Dashboard: http://localhost:18888
```

### Enhanced Development Workflow:
```bash
# Rebuild specific service with cache busting
docker-compose -f docker-compose.dev.yml build --no-cache erp-api-dev
docker-compose -f docker-compose.dev.yml up -d erp-api-dev

# Database operations
# Run migrations
docker exec -it erp-api-dev dotnet ef database update

# Create new migration
docker exec -it erp-api-dev dotnet ef migrations add InitialCreate

# Drop and recreate database
docker exec -it erp-api-dev dotnet ef database drop --force
docker exec -it erp-api-dev dotnet ef database update

# Seed database with test data
docker exec -it erp-api-dev dotnet run --seed-data

# Frontend operations
# Install new packages
docker exec -it erp-frontend-dev npm install <package-name>

# Run frontend build
docker exec -it erp-frontend-dev npm run build

# Run frontend tests
docker exec -it erp-frontend-dev npm test

# Backend operations  
# Run tests
docker exec -it erp-api-dev dotnet test

# Generate API client
docker exec -it erp-api-dev dotnet tool install --global Microsoft.dotnet-openapi
docker exec -it erp-api-dev dotnet openapi add url http://localhost:8080/swagger/v1/swagger.json

# Package management
# Update all packages to latest versions
docker exec -it erp-api-dev dotnet outdated --upgrade

# Performance and debugging
# View container resource usage
docker stats

# Access container shell
docker exec -it erp-api-dev bash
docker exec -it erp-postgres-dev psql -U postgres -d erp_system_dev

# Redis operations
docker exec -it erp-redis-dev redis-cli
# In redis-cli: FLUSHALL (clear cache)

# Clean up operations
# Remove containers and volumes (destructive)
docker-compose -f docker-compose.dev.yml down -v --remove-orphans

# Clean up images and build cache
docker system prune -af

# Restart specific service
docker-compose -f docker-compose.dev.yml restart erp-api-dev
```

### Monitoring and Debugging:
```bash
# Health check endpoints
curl http://localhost:5001/health
curl http://localhost:5000/health

# View OpenTelemetry traces
# Access Aspire Dashboard at http://localhost:18890

# Monitor logs in real-time with filtering
docker-compose -f docker-compose.dev.yml logs -f --tail=100 erp-api-dev | grep ERROR

# Database performance monitoring
docker exec -it erp-postgres-dev psql -U postgres -d erp_system_dev -c "
  SELECT query, mean_exec_time, calls 
  FROM pg_stat_statements 
  ORDER BY mean_exec_time DESC 
  LIMIT 10;"

# Redis monitoring
docker exec -it erp-redis-dev redis-cli info memory
```

### Production Maintenance:
```bash
# Rolling updates (zero-downtime deployment)
docker-compose pull
docker-compose up -d --no-deps erp-api

# Backup database
docker exec erp-postgres pg_dump -U postgres erp_system > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
docker exec -i erp-postgres psql -U postgres -d erp_system < backup.sql

# View production metrics
curl http://localhost:5000/metrics

# SSL certificate renewal (if using Let's Encrypt)
docker-compose exec nginx certbot renew --nginx
```

---

## 📝 ENVIRONMENT FILES

### .env (Production)
```env
# Database Configuration
DB_NAME=erp_system
DB_USER=postgres
DB_PASSWORD=your-super-secure-password-change-this

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-change-this-in-production
JWT_ISSUER=ERPSystem
JWT_AUDIENCE=ERPUsers
JWT_EXPIRY_MINUTES=60

# Application Settings
ASPNETCORE_ENVIRONMENT=Production
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=production

# Optional: External Services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### .env.dev (Development)
```env
# Database Configuration
DB_NAME=erp_system_dev
DB_USER=postgres
DB_PASSWORD=postgres123

# JWT Configuration (Development Only)
JWT_SECRET=development-jwt-secret-key-not-for-production-use
JWT_ISSUER=ERPSystem
JWT_AUDIENCE=ERPUsers
JWT_EXPIRY_MINUTES=1440

# Application Settings
ASPNETCORE_ENVIRONMENT=Development
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_ENVIRONMENT=development
```

This complete implementation plan merges your database schema with modern Docker containerization and ShadCN/UI dark mode frontend. The plan provides a production-ready ERP system with comprehensive features, clean architecture, and efficient development workflow.