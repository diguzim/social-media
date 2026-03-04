# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy all apps and packages
COPY apps ./apps
COPY packages ./packages

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prefer-offline

# Build the event-handler-service and dependencies
RUN pnpm --filter event-handler-service build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy built app
COPY --from=builder /app/apps/event-handler-service/dist ./dist

# Copy relevant source for reference
COPY apps/event-handler-service/src ./src

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prefer-offline --prod

EXPOSE 5000

CMD ["node", "dist/main.js"]
