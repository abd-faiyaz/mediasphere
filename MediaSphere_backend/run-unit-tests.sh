#!/bin/bash
echo "=== Running All Unit Tests ==="
echo "Current directory: $(pwd)"
echo ""

# Run all tests
echo "Running all unit tests..."
./mvnw.cmd test

echo ""
echo "=== Test Coverage Report ==="
echo "Generating coverage report..."
./mvnw.cmd jacoco:report
echo "Coverage report generated at: target/site/jacoco/index.html"

echo ""
echo "=== Test Results Summary ==="
echo "Check target/surefire-reports/ for detailed results"
echo ""
echo "=== Individual Test Classes ==="
echo "1. AuthServiceTest - Authentication service tests"
echo "2. UserServiceTest - User management tests"
echo "3. ThreadServiceTest - Thread/post management tests"
echo "4. ClubServiceTest - Club management tests"
echo "5. SimpleTest - Basic functionality tests"
