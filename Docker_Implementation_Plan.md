# ERP System - Docker + ShadCN Implementation Plan
## ASP.NET Core API + React.js with ShadCN/UI Dark Mode

### 🐳 DOCKER ARCHITECTURE

#### Project Structure with Docker:
```
erp-system/
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env
├── backend/
│   ├── ERP.API/
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
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

## 🐋 DOCKER CONFIGURATION

### 1. Main docker-compose.yml
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
    ports:
      - "5000:80"
    depends_on:
      - postgres
    networks:
      - erp-network
    restart: unless-stopped

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
      - api
    networks:
      - erp-network
    restart: unless-stopped

  # Nginx Reverse Proxy (Optional)
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
  postgres_data:

networks:
  erp-network:
    driver: bridge
```

### 2. Development docker-compose.dev.yml
```yaml
version: '3.8'

services:
  # Development PostgreSQL
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

  # Development API with hot reload
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

  # Development Frontend with hot reload
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

### 3. Environment Variables (.env)
```env
# Database Configuration
DB_NAME=erp_system
DB_USER=postgres
DB_PASSWORD=postgres123

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ISSUER=ERPSystem
JWT_AUDIENCE=ERPUsers
JWT_EXPIRY_MINUTES=60

# Application Settings
ASPNETCORE_ENVIRONMENT=Production
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📁 DOCKERFILE CONFIGURATIONS

### Backend Dockerfile (Production)
```dockerfile
# backend/Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["ERP.API/ERP.API.csproj", "ERP.API/"]
RUN dotnet restore "ERP.API/ERP.API.csproj"
COPY . .
WORKDIR "/src/ERP.API"
RUN dotnet build "ERP.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ERP.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ERP.API.dll"]
```

### Backend Dockerfile.dev (Development)
```dockerfile
# backend/Dockerfile.dev
FROM mcr.microsoft.com/dotnet/sdk:7.0
WORKDIR /app

COPY ["ERP.API/ERP.API.csproj", "ERP.API/"]
RUN dotnet restore "ERP.API/ERP.API.csproj"

COPY . .
WORKDIR /app/ERP.API

EXPOSE 80
CMD ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:80"]
```

### Frontend Dockerfile (Production)
```dockerfile
# frontend/Dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Frontend Dockerfile.dev (Development)
```dockerfile
# frontend/Dockerfile.dev
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

---

## 🎨 SHADCN/UI DARK MODE SETUP

### 1. Frontend Package.json
```json
{
  "name": "erp-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    "axios": "^1.5.0",
    "react-hook-form": "^7.47.0",
    "react-query": "^3.39.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.290.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7"
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

### 2. ShadCN Configuration

#### tailwind.config.js
```javascript
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

#### globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 3. Theme Provider Component
```tsx
// src/components/theme/theme-provider.tsx
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
```

### 4. Theme Toggle Component
```tsx
// src/components/theme/theme-toggle.tsx
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

---

## 🚀 DOCKER DEVELOPMENT WORKFLOW

### Quick Start Commands:
```bash
# Development environment
docker-compose -f docker-compose.dev.yml up -d

# Production environment
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f frontend

# Rebuild specific service
docker-compose build api
docker-compose up -d api

# Clean up
docker-compose down
docker-compose down -v  # Remove volumes too
```

### VS Code Development Setup:
1. Install Docker extension
2. Use Dev Containers extension for development
3. Configure .devcontainer.json for integrated development

This setup provides a complete containerized ERP system with modern dark mode UI using ShadCN/UI components and efficient Docker management for both development and production environments.