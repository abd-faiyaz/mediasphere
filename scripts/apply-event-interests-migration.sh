#!/bin/bash

# Event Interests Migration Script
# This script applies the event interests table migration

echo "Applying Event Interests Migration..."

# Database connection details (modify as needed)
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="mediasphere"
DB_USER="postgres"

# Apply the migration
echo "Creating event_interests table..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f SQL_files/event_interests_migration.sql

if [ $? -eq 0 ]; then
    echo "✅ Event interests migration applied successfully!"
    echo "📊 Checking table structure..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\d event_interests"
else
    echo "❌ Failed to apply event interests migration"
    exit 1
fi

echo "🎉 Event interests feature is now ready!"
echo "Users can now show interest in events and creators will receive notifications."
