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

# Create directories for custom configuration
RUN mkdir -p /docker-entrypoint-initdb.d \
    && mkdir -p /var/lib/postgresql/backup \
    && mkdir -p /var/log/postgresql

# Copy initialization scripts
COPY init/*.sql /docker-entrypoint-initdb.d/

# Copy custom PostgreSQL configuration
COPY postgresql.conf /etc/postgresql/postgresql.conf

# Create backup script
COPY scripts/backup.sh /usr/local/bin/backup-db
COPY scripts/restore.sh /usr/local/bin/restore-db
COPY scripts/health-check.sh /usr/local/bin/health-check

# Make scripts executable
RUN chmod +x /usr/local/bin/backup-db \
    && chmod +x /usr/local/bin/restore-db \
    && chmod +x /usr/local/bin/health-check

# Set proper ownership
RUN chown -R postgres:postgres /var/lib/postgresql/backup \
    && chown -R postgres:postgres /var/log/postgresql

# Expose PostgreSQL port
EXPOSE 5432

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /usr/local/bin/health-check

# Use default PostgreSQL entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
