# Build Stage
FROM oven/bun:alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Run build script
RUN bun run build

# Production Stage
FROM oven/bun:alpine
WORKDIR /app

# Copy production files from builder
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules

# Expose port
EXPOSE 4000

# Start command
CMD ["bun", "./dist/server.js"]
