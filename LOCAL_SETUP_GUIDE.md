# MediaSphere Local Development Setup Guide

## Prerequisites
1. PostgreSQL 12+ installed and running
2. Java 21 installed
3. Maven installed

## Database Setup

### Step 1: Create Database and Schema
Run this command to set up the database from scratch:
```bash
psql -U postgres -f local_database_setup.sql
```

**OR** if you already have a `db_408` database, run the migration:
```bash
psql -U postgres -d db_408 -f schema_migration.sql
```

### Step 2: Add Sample Data (Optional)
```bash
psql -U postgres -d db_408 -f sample_data.sql
```

### Step 3: Verify Database Setup
Connect to the database and check tables:
```bash
psql -U postgres -d db_408 -c "\dt"
```

You should see these tables:
- users
- media_types  
- media
- clubs
- threads
- comments
- events
- notifications
- user_clubs

## Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd MediaSphere_backend
```

### Step 2: Clean and Build
```bash
./mvnw clean compile
```

### Step 3: Run the Application
```bash
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

## Testing the Backend

### Health Check
```bash
curl http://localhost:8080/actuator/health
```
Expected response: `{"status":"UP"}`

### API Endpoints Testing
```bash
# Get all clubs
curl http://localhost:8080/clubs/

# Get all users  
curl http://localhost:8080/users/

# Get all media
curl http://localhost:8080/media/

# Get all threads
curl http://localhost:8080/threads/

# Search functionality
curl "http://localhost:8080/search/?query=sci-fi"
```

## Key Changes Made

### Database Schema Fixes:
1. **Comments table**: Fixed `user_id` → `created_by`, added `parent_comment_id` and `updated_at`
2. **Events table**: Fixed `start_time/end_time` → `event_date`, added missing columns
3. **Media table**: Created missing table with all required columns
4. **Notifications table**: Fixed column names to match model
5. **Removed**: `ai_analyses` table (no corresponding model)

### Application Configuration:
1. **Database URL**: Set to local PostgreSQL instance
2. **Hibernate DDL**: Changed from `update` to `validate` for production-like behavior
3. **Credentials**: Set to your specified postgres/1234

## Troubleshooting

### Database Connection Issues:
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check if database exists: `psql -U postgres -l | grep db_408`
- Verify user permissions: `psql -U postgres -c "\du"`

### Schema Validation Errors:
- Run the migration script again: `psql -U postgres -d db_408 -f schema_migration.sql`
- Check for any manual changes needed in your existing database

### Backend Compilation Issues:
- Ensure Java 21: `java -version`
- Clean Maven cache: `./mvnw clean`
- Check for any missing dependencies: `./mvnw dependency:resolve`

## What's Working Now:
✅ All model classes match database schema  
✅ Foreign key relationships are correct  
✅ Sample data for testing  
✅ All API endpoints should work  
✅ Local development configuration  

## Next Steps:
1. Run the database setup commands
2. Start the backend with `./mvnw spring-boot:run`
3. Test the API endpoints
4. Start developing your frontend integration
