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

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

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

# Copy only the necessary files from the build stage
COPY --from=build /app/dist dist
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/package.json package.json

# Create and set permissions for temp directory
RUN mkdir -p /app/tmp && chmod 777 /app/tmp

# Set Docker as non-root user
USER node