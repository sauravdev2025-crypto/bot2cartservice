#
# 🏡 Production Build
#
FROM node:20.19.4-alpine AS build

# Add missing shared libraries and Python (and build tools)
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Set to production environment
ENV NODE_ENV production

# Copy package.json and yarn.lock first for caching
COPY package.json yarn.lock ./

# Install all dependencies (including dev dependencies for build)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Generate the production build.
RUN apk add --no-cache bash
RUN npm install -g @servicelabsco/slabs-dev-cli@1.0.11
RUN npm install -g @nestjs/cli@10.4.8
RUN sl syncServerClasses

# RUN npm install -g @nestjs/cli@10.4.8
RUN yarn build

#
# 🚀 Production Server
#
FROM node:20.19.4-alpine AS prod

# Add missing shared libraries
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Set to production environment
ENV NODE_ENV production
ENV CLI_PATH './dist/cli.js'

# Copy package files for production dependency installation
COPY --from=build /app/package.json package.json
COPY --from=build /app/yarn.lock yarn.lock

# Install only production dependencies
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy built application
COPY --from=build /app/dist dist

# Copy required JSON files (like service account credentials)
COPY --from=build /app/dartinbox-f9514-21057035628e.json dartinbox-f9514-21057035628e.json

# Create and set permissions for temp directory
RUN mkdir -p /app/tmp && chmod 777 /app/tmp

# Expose port (Railway will set PORT env var)
EXPOSE 4000

# Set Docker as non-root user
USER node

# Start the application
CMD ["node", "dist/main.js"]