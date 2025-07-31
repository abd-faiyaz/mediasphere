# MediaSphere PostgreSQL Database Container
# Optimized for Azure VM deployment with MediaSphere application

FROM postgres:16-alpine

# Install additional packages for Azure VM compatibility
RUN apk add --no-cache \
    curl \
    tzdata \
    && rm -rf /var/cache/apk/*

# Set timezone for Azure deployment
ENV TZ=UTC

# Remove the environment variable defaults - they will be set at runtime
# ENV POSTGRES_DB will be set by docker-compose or docker run
# ENV POSTGRES_USER will be set by docker-compose or docker run  
# ENV POSTGRES_PASSWORD will be set by docker-compose or docker run

# Create directories for custom configuration
RUN mkdir -p /docker-entrypoint-initdb.d \
    && mkdir -p /var/lib/postgresql/backup \
    && mkdir -p /var/log/postgresql

# Copy initialization scripts
COPY init/*.sql /docker-entrypoint-initdb.d/

# Set environment variables for consistent database setup
ENV POSTGRES_DB=db_408
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=1234

# Make initialization scripts executable
RUN chmod -R 755 /docker-entrypoint-initdb.d/

# Set proper ownership for directories we created
RUN chown -R postgres:postgres /var/lib/postgresql/backup \
    && chown -R postgres:postgres /var/log/postgresql

# Expose PostgreSQL port
EXPOSE 5432

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD pg_isready || exit 1

# Use default PostgreSQL entrypoint and default configuration
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["postgres"]
