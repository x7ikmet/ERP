# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.16.0
ARG PNPM_VERSION=10.12.2

# Build stage
FROM node:${NODE_VERSION}-alpine as builder

# Install pnpm
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies for build)
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the Next.js application
RUN pnpm build

# Production stage
FROM node:${NODE_VERSION}-alpine as runner

# Install pnpm in production image
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV production

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/public ./public

USER nextjs

# Expose port 3000 (Next.js default)
EXPOSE 3000

# Start the Next.js server
CMD ["node", "server.js"]
