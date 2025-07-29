# MediaSphere Frontend Dockerfile
# Optimized for production deployment with environment variable support

# Stage 1: Dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (allow lockfile updates)
RUN pnpm install --no-frozen-lockfile

# Stage 2: Build
FROM node:18-alpine AS build
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables with default values
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bG9naWNhbC1sZW1taW5nLTI3LmNsZXJrLmFjY291bnRzLmRldiQ
ENV CLERK_SECRET_KEY=sk_test_hFzWxK70KYY2p2nUo6xR30DcecKCIYYxpeMRxhD8ae
ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN pnpm build

# Stage 3: Runtime
FROM node:18-alpine AS runtime

# Install wget for healthcheck
RUN apk add --no-cache wget

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from build stage
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Set runtime environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "server.js"]