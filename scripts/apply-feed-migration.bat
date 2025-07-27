@echo off
echo Starting feed migration...

REM Database connection parameters
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=mediasphere_db
set DB_USER=mediasphere_user

REM Check if PGPASSWORD environment variable is set
if "%PGPASSWORD%"=="" (
    echo Please set PGPASSWORD environment variable or enter password when prompted
)

REM Apply the migration
echo Applying feed migration...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f ..\SQL_files\feed_migration.sql

REM Check if migration was successful
if %errorlevel% equ 0 (
    echo ✅ Feed migration completed successfully!
    echo 📊 The following enhancements were added:
    echo    - last_activity_at column for tracking thread activity
    echo    - Indexes for optimized feed queries
    echo    - Support for infinite scroll trending algorithm
) else (
    echo ❌ Migration failed. Please check the error messages above.
    exit /b 1
)

echo 🚀 Backend is now ready for infinite scroll feed!
pause
