# ============================================================================
# Simple Production Dockerfile
# ============================================================================

# ----------------------------------------------------------------------------
# Build Stage
# ----------------------------------------------------------------------------
FROM node:20.19.4-alpine AS build

# Install system dependencies
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Configure yarn for better reliability
RUN yarn config set network-timeout 300000 && \
    yarn config set network-concurrency 1

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with retry logic
RUN for i in 1 2 3; do \
        yarn install --frozen-lockfile --network-timeout 300000 && break || \
        (echo "Attempt $i failed, retrying..." && sleep $((i*5))); \
    done

# Copy source code
COPY . .

# Build the application
RUN yarn build

# ----------------------------------------------------------------------------
# Production Stage
# ----------------------------------------------------------------------------
FROM node:20.19.4-alpine AS prod

# Install runtime dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    CLI_PATH='./dist/cli.js'

# Copy package files
COPY --from=build /app/package.json /app/yarn.lock ./

# Install only production dependencies
RUN yarn config set network-timeout 300000 && \
    yarn config set network-concurrency 1 && \
    for i in 1 2 3; do \
        yarn install --frozen-lockfile --production --network-timeout 300000 && break || \
        (echo "Attempt $i failed, retrying..." && sleep $((i*5))); \
    done && \
    yarn cache clean

# Copy built application
COPY --from=build /app/dist ./dist

# Create temp directory
RUN mkdir -p /app/tmp && chmod 755 /app/tmp

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "dist/main.js"]
