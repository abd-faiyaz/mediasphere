#!/bin/bash
# MediaSphere VM Setup Script
# Run this script on your Azure VM to set up the deployment environment

set -e

echo "🚀 Setting up MediaSphere deployment environment on Azure VM..."

# Update system
echo "📦 Updating system packages..."
sudo apt update

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    sudo apt install -y docker.io docker-compose-v2
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER
    echo "✅ Docker installed successfully"
else
    echo "✅ Docker is already installed"
fi

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p ~/mediasphere-deploy
cd ~/mediasphere-deploy

# Create docker-compose.production.yml file
echo "📄 Creating docker-compose.production.yml..."
cat > docker-compose.production.yml << 'EOF'
# MediaSphere Production Deployment
# Docker Compose file for Azure VM deployment

services:
  # PostgreSQL Database
  postgres:
    image: abdfaiyaz/mediasphere-db:latest
    container_name: mediasphere-postgres
    environment:
      - POSTGRES_USER=${DB_USER:-postgres}
      - POSTGRES_PASSWORD=${DB_PASSWORD:-1234}
      - POSTGRES_DB=${DB_NAME:-db_408}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - postgres_logs:/var/log/postgresql
    ports:
      - "${DB_PORT:-5432}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-db_408}"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s
    networks:
      - mediasphere-network
    restart: unless-stopped

  # Spring Boot Backend
  backend:
    image: abdfaiyaz/mediasphere-backend:latest
    container_name: mediasphere-backend
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=${DB_NAME:-db_408}
      - DB_USER=${DB_USER:-postgres}
      - DB_PASSWORD=${DB_PASSWORD:-1234}
      - SERVER_PORT=8080
      - JAVA_OPTS=-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC
    ports:
      - "${BACKEND_PORT:-8080}:8080"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    networks:
      - mediasphere-network
    restart: unless-stopped

  # Next.js Frontend
  frontend:
    image: abdfaiyaz/mediasphere-frontend:latest
    container_name: mediasphere-frontend
    environment:
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY:-pk_test_d2lsbGluZy1ncml6emx5LTcxLmNsZXJrLmFjY291bnRzLmRldiQ}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY:-sk_test_O8V5wdjJQN86fP8wZATYQ0yEmIaKEa2kxrv4lGNKI0}
      - NEXT_PUBLIC_API_BASE_URL=http://${BACKEND_HOST:-localhost}:${BACKEND_PORT:-8080}
      - NEXT_PUBLIC_APP_URL=http://${FRONTEND_HOST:-localhost}:${FRONTEND_PORT:-3000}
    ports:
      - "${FRONTEND_PORT:-3000}:3000"
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s
    networks:
      - mediasphere-network
    restart: unless-stopped

# Volumes for persistent data
volumes:
  postgres_data:
    driver: local
  postgres_logs:
    driver: local

# Networks
networks:
  mediasphere-network:
    driver: bridge
EOF

# Create .env file
echo "⚙️ Creating .env file..."
cat > .env << 'EOF'
# Production Environment Variables for Azure VM
DB_USER=postgres
DB_PASSWORD=1234
DB_NAME=db_408
DB_PORT=5432

BACKEND_PORT=8080
BACKEND_HOST=20.244.25.13

FRONTEND_PORT=3000
FRONTEND_HOST=20.244.25.13

CLERK_PUBLISHABLE_KEY=pk_test_d2lsbGluZy1ncml6emx5LTcxLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_O8V5wdjJQN86fP8wZATYQ0yEmIaKEa2kxrv4lGNKI0
EOF

# Create management scripts
echo "🔧 Creating management scripts..."

# Create start script
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting MediaSphere services..."
sudo docker compose -f docker-compose.production.yml up -d
echo "✅ Services started!"
sudo docker compose -f docker-compose.production.yml ps
EOF

# Create stop script
cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping MediaSphere services..."
sudo docker compose -f docker-compose.production.yml down
echo "✅ Services stopped!"
EOF

# Create logs script
cat > logs.sh << 'EOF'
#!/bin/bash
if [ "$1" ]; then
    echo "📋 Showing logs for $1..."
    sudo docker compose -f docker-compose.production.yml logs -f "$1"
else
    echo "📋 Showing all logs..."
    sudo docker compose -f docker-compose.production.yml logs -f
fi
EOF

# Create status script
cat > status.sh << 'EOF'
#!/bin/bash
echo "📊 MediaSphere Service Status:"
sudo docker compose -f docker-compose.production.yml ps
echo ""
echo "🩺 Health Checks:"
echo "Backend: $(curl -s http://localhost:8080/actuator/health 2>/dev/null | grep -o '"status":"[^"]*"' || echo 'Not responding')"
echo "Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo 'Not responding')"
EOF

# Create update script
cat > update.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating MediaSphere to latest images..."
sudo docker compose -f docker-compose.production.yml pull
sudo docker compose -f docker-compose.production.yml down
sudo docker compose -f docker-compose.production.yml up -d
echo "✅ Update completed!"
sudo docker compose -f docker-compose.production.yml ps
EOF

# Make scripts executable
chmod +x *.sh

echo ""
echo "🎉 MediaSphere deployment environment setup complete!"
echo ""
echo "📍 Deployment directory: ~/mediasphere-deploy"
echo "📁 Files created:"
echo "   - docker-compose.production.yml"
echo "   - .env"
echo "   - start.sh"
echo "   - stop.sh" 
echo "   - logs.sh"
echo "   - status.sh"
echo "   - update.sh"
echo ""
echo "🚀 To start MediaSphere:"
echo "   cd ~/mediasphere-deploy && ./start.sh"
echo ""
echo "📊 To check status:"
echo "   cd ~/mediasphere-deploy && ./status.sh"
echo ""
echo "🔧 Note: You may need to log out and back in for Docker permissions to take effect"
