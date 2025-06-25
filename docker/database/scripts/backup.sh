#!/bin/bash
# MediaSphere Database Backup Script
# Usage: backup-db [backup_name]

set -e

BACKUP_DIR="/var/lib/postgresql/backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="${1:-mediasphere_backup_$TIMESTAMP}"
BACKUP_FILE="$BACKUP_DIR/${BACKUP_NAME}.sql"

echo "Starting database backup..."
echo "Backup file: $BACKUP_FILE"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform the backup
pg_dump -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$BACKUP_FILE"

# Compress the backup
gzip "$BACKUP_FILE"

echo "Database backup completed successfully!"
echo "Backup saved as: ${BACKUP_FILE}.gz"
echo "Backup size: $(du -h ${BACKUP_FILE}.gz | cut -f1)"

# Clean up old backups (keep last 7 days)
find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +7 -delete 2>/dev/null || true

echo "Old backups cleaned up (keeping last 7 days)"
