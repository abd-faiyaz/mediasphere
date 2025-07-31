@echo off
REM Event Interests Migration Script for Windows
REM This script applies the event interests table migration

echo Applying Event Interests Migration...

REM Database connection details (modify as needed)
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=mediasphere
set DB_USER=postgres

REM Apply the migration
echo Creating event_interests table...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f SQL_files/event_interests_migration.sql

if %ERRORLEVEL% EQU 0 (
    echo ✅ Event interests migration applied successfully!
    echo 📊 Checking table structure...
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "\d event_interests"
) else (
    echo ❌ Failed to apply event interests migration
    exit /b 1
)

echo 🎉 Event interests feature is now ready!
echo Users can now show interest in events and creators will receive notifications.
pause
