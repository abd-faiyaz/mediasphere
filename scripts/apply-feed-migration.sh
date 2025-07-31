#!/bin/bash

# Feed Migration Script
# Adds last_activity_at column and indexes for infinite scroll feed

echo "Starting feed migration..."

# Database connection parameters
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="db_408"
DB_USER="postgres"

# Check if PGPASSWORD environment variable is set
if [ -z "$PGPASSWORD" ]; then
    echo "Please set PGPASSWORD environment variable or enter password when prompted"
fi

# Apply the migration
echo "Applying feed migration..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ../SQL_files/feed_migration.sql

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo "✅ Feed migration completed successfully!"
    echo "📊 The following enhancements were added:"
    echo "   - last_activity_at column for tracking thread activity"
    echo "   - Indexes for optimized feed queries"
    echo "   - Support for infinite scroll trending algorithm"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi

echo "🚀 Backend is now ready for infinite scroll feed!"
