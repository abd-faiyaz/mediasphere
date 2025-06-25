# MediaSphere Frontend Dockerfile
# Next.js SSR build for production deployment

# Stage 1: Dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Stage 2: Build application
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_d2lsbGluZy1ncml6emx5LTcxLmNsZXJrLmFjY291bnRzLmRldiQ
ENV CLERK_SECRET_KEY=sk_test_O8V5wdjJQN86fP8wZATYQ0yEmIaKEa2kxrv4lGNKI0
ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000

# Build the application with error handling
RUN npm run build || (echo "Build failed, checking for common issues..." && \
    echo "Node version: $(node --version)" && \
    echo "NPM version: $(npm --version)" && \
    ls -la && \
    cat next.config.mjs && \
    exit 1)

# Stage 3: Production runtime
FROM node:18-alpine AS runtime

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from build stage
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "server.js"]
