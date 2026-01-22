# ============================================================================
# 🏗️  Multi-Stage Production Dockerfile
# ============================================================================
# This Dockerfile uses multi-stage builds to create an optimized production
# image with minimal size and maximum security.
# ============================================================================

# ----------------------------------------------------------------------------
# Stage 1: Base Dependencies
# ----------------------------------------------------------------------------
# Install system dependencies and configure Node.js environment
FROM node:20.19.4-alpine AS base

# Install system dependencies in a single layer
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    bash \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Configure yarn for better reliability
RUN yarn config set network-timeout 300000 && \
    yarn config set network-concurrency 1 && \
    yarn config set registry https://registry.yarnpkg.com

# ----------------------------------------------------------------------------
# Stage 2: Dependencies Installation
# ----------------------------------------------------------------------------
# Install all dependencies (including dev dependencies for build)
FROM base AS dependencies

# Copy dependency files first for better layer caching
COPY package.json yarn.lock ./

# Install dependencies with retry logic and error handling
RUN set -eux; \
    for i in 1 2 3; do \
        echo "Attempt $i: Installing dependencies..."; \
        yarn install --frozen-lockfile --network-timeout 300000 && break || \
        (echo "Attempt $i failed, retrying in $((i*5)) seconds..." && sleep $((i*5))); \
    done || (echo "All installation attempts failed" && exit 1)

# ----------------------------------------------------------------------------
# Stage 3: Build Tools Installation
# ----------------------------------------------------------------------------
# Install global build tools
FROM dependencies AS build-tools

# Install global CLI tools in a single layer
RUN npm install -g \
    @servicelabsco/slabs-dev-cli@1.0.11 \
    @nestjs/cli@10.4.8 \
    && npm cache clean --force

# ----------------------------------------------------------------------------
# Stage 4: Source Code and Build
# ----------------------------------------------------------------------------
# Copy source code and build the application
FROM build-tools AS build

# Copy source code (excluding files in .dockerignore)
COPY . .

# Set build environment
ENV NODE_ENV=production

# Run syncServerClasses with error handling
# The command may try to unlink files that don't exist, so we handle that gracefully
# First, ensure the directory structure exists
RUN set -eux; \
    echo "Preparing for syncServerClasses..."; \
    mkdir -p src/utility/services src/business/services src/common src/socket || true; \
    echo "Running syncServerClasses..."; \
    (sl syncServerClasses 2>&1 | tee /tmp/sync-output.log) || { \
        SYNC_EXIT_CODE=$?; \
        echo "syncServerClasses exited with code: $SYNC_EXIT_CODE"; \
        cat /tmp/sync-output.log || true; \
        if grep -q "ENOENT.*unlink" /tmp/sync-output.log 2>/dev/null; then \
            echo "Warning: File unlink error detected (file may not exist yet)"; \
            echo "This is often expected during first-time generation. Continuing build..."; \
        else \
            echo "Error: syncServerClasses failed with unexpected error"; \
            exit $SYNC_EXIT_CODE; \
        fi; \
    }

# Build the application
RUN echo "Building NestJS application..." && \
    yarn build && \
    echo "Build completed successfully"

# Verify build output exists
RUN test -d dist && test -f dist/main.js || (echo "Build output not found!" && exit 1)

# ----------------------------------------------------------------------------
# Stage 5: Production Dependencies
# ----------------------------------------------------------------------------
# Install only production dependencies for final image
FROM base AS production-deps

# Copy package files
COPY --from=build /app/package.json /app/yarn.lock ./

# Install production dependencies with retry logic
RUN set -eux; \
    for i in 1 2 3; do \
        echo "Attempt $i: Installing production dependencies..."; \
        yarn install --frozen-lockfile --production --network-timeout 300000 && break || \
        (echo "Attempt $i failed, retrying in $((i*5)) seconds..." && sleep $((i*5))); \
    done || (echo "All installation attempts failed" && exit 1); \
    yarn cache clean && \
    rm -rf /tmp/* /var/tmp/*

# ----------------------------------------------------------------------------
# Stage 6: Production Runtime
# ----------------------------------------------------------------------------
# Final optimized production image
FROM base AS prod

# Install only runtime dependencies (no build tools)
RUN apk add --no-cache \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production \
    CLI_PATH='./dist/cli.js' \
    NODE_OPTIONS='--max-old-space-size=512'

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies from production-deps stage
COPY --from=production-deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy package files (needed for runtime)
COPY --from=build --chown=nodejs:nodejs /app/package.json ./

# Copy built application from build stage
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist

# Create and set permissions for temp directory
RUN mkdir -p /app/tmp && \
    chmod 755 /app/tmp && \
    chown nodejs:nodejs /app/tmp

# Switch to non-root user
USER nodejs

# Health check (optional - uncomment if needed)
# HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:${PORT:-4000}/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Expose port (Railway will set PORT env var)
EXPOSE 4000

# Use exec form to ensure proper signal handling
CMD ["node", "dist/main.js"]
