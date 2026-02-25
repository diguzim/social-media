# Stage 1: Dependencies
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace and package files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY packages/log-context/package.json ./packages/log-context/package.json
COPY apps/posts-service/package.json ./apps/posts-service/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

# Copy workspace config and source files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY packages ./packages
COPY apps/posts-service ./apps/posts-service

# Build the posts-service and its dependencies
RUN pnpm turbo build --filter=posts-service

# Stage 3: Production
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy package.json files for workspace structure
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY packages/log-context/package.json ./packages/log-context/package.json
COPY apps/posts-service/package.json ./apps/posts-service/package.json

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts from builder
COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /app/packages/log-context/dist ./packages/log-context/dist
COPY --from=builder /app/apps/posts-service/dist ./apps/posts-service/dist

# Set working directory to the service
WORKDIR /app/apps/posts-service

# Expose the microservice port
EXPOSE 4001

# Run the service
CMD ["node", "dist/main.js"]
