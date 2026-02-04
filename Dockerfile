# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
# This runs the custom build script which uses vite for client and esbuild for server
RUN npm run build

# Remove development dependencies to keep the image small
# The server build bundles some dependencies but keeps others external
RUN npm prune --production

# Stage 2: Production Runtime
FROM node:20-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the application port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
