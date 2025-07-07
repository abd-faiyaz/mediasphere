@echo off
echo Running unit tests...
echo.
./mvnw.cmd test -Dtest=SimpleTest
echo.
echo Test execution completed.
pause
