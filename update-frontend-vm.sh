#!/bin/bash

# MediaSphere VM Frontend Update Script
# Run this script on your Azure VM to update the frontend container

set -e

echo "=== MediaSphere Frontend VM Update ==="
echo "Starting at: $(date)"

echo "Stopping current frontend container..."
docker-compose -f docker-compose.production.yml stop frontend

echo "Removing old frontend container..."
docker-compose -f docker-compose.production.yml rm -f frontend

echo "Pulling updated frontend image..."
docker-compose -f docker-compose.production.yml pull frontend

echo "Starting updated frontend container..."
docker-compose -f docker-compose.production.yml up -d frontend

echo "Waiting for container to start..."
sleep 10

echo "Checking container status..."
docker-compose -f docker-compose.production.yml ps

echo "Checking frontend logs..."
docker-compose -f docker-compose.production.yml logs --tail=20 frontend

echo "=== Frontend Update Complete ==="
echo "Finished at: $(date)"
echo "Frontend should be accessible at: http://20.255.51.86:3000"
