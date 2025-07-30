#!/bin/bash

# MediaSphere Frontend Rebuild and Redeploy Script
# This script rebuilds the frontend Docker image and redeploys it

set -e

echo "=== MediaSphere Frontend Rebuild and Redeploy ==="
echo "Starting at: $(date)"

# Navigate to frontend directory
cd MediaSphere_frontend

echo "Building frontend Docker image..."
docker build -t abdfaiyaz/mediasphere-frontend:latest .

echo "Pushing frontend image to Docker Hub..."
docker push abdfaiyaz/mediasphere-frontend:latest

echo "Frontend image rebuild complete!"

# Navigate back to root
cd ..

echo "Pulling updated image on VM and restarting containers..."
echo "You can now run this on your VM:"
echo "docker-compose -f docker-compose.production.yml pull frontend"
echo "docker-compose -f docker-compose.production.yml up -d frontend"

echo "=== Rebuild Complete ==="
echo "Finished at: $(date)"
