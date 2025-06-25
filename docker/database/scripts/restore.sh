#!/bin/bash
# MediaSphere Database Restore Script
# Usage: restore-db <backup_file>

set -e

if [ $# -eq 0 ]; then
    echo "Usage: restore-db <backup_file>"
    echo "Available backups:"
    ls -la /var/lib/postgresql/backup/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"
BACKUP_DIR="/var/lib/postgresql/backup"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    # Try to find in backup directory
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    else
        echo "Error: Backup file '$BACKUP_FILE' not found"
        exit 1
    fi
fi

echo "Starting database restore..."
echo "Restore file: $BACKUP_FILE"

# Check if file is gzipped
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Decompressing backup file..."
    TEMP_FILE="/tmp/restore_temp.sql"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    RESTORE_FILE="$TEMP_FILE"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Warning about data loss
echo "WARNING: This will replace all existing data in the database!"
echo "Press Ctrl+C to cancel, or wait 10 seconds to continue..."
sleep 10

# Drop existing connections
psql -h localhost -U "$POSTGRES_USER" -d postgres -c "
    SELECT pg_terminate_backend(pid) 
    FROM pg_stat_activity 
    WHERE datname = '$POSTGRES_DB' AND pid <> pg_backend_pid();
"

# Drop and recreate database
psql -h localhost -U "$POSTGRES_USER" -d postgres -c "DROP DATABASE IF EXISTS $POSTGRES_DB;"
psql -h localhost -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $POSTGRES_DB;"

# Restore the backup
psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$RESTORE_FILE"

# Clean up temp file
if [ -f "$TEMP_FILE" ]; then
    rm "$TEMP_FILE"
fi

echo "Database restore completed successfully!"
