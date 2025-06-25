#!/bin/bash
# MediaSphere Database Health Check Script
# Used by Docker health check and monitoring

set -e

# Check if PostgreSQL is responding
pg_isready -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -q

# Check if we can connect and run a simple query
psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1;" > /dev/null 2>&1

# Check if main tables exist
TABLES_COUNT=$(psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ('users', 'clubs', 'media_types');
")

if [ "$TABLES_COUNT" -lt 3 ]; then
    echo "Error: Essential tables not found"
    exit 1
fi

echo "Database health check passed"
exit 0
