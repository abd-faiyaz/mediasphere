# MediaSphere Deployment Guide

## Prerequisites on Target VM (Azure)

1. **Install Docker and Docker Compose:**
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose-v2
   sudo systemctl enable docker
   sudo systemctl start docker
   sudo usermod -aG docker $USER
   ```

2. **Login to Docker Hub:**
   ```bash
   sudo docker login
   ```

## Deployment Steps

1. **Create deployment directory:**
   ```bash
   mkdir -p ~/mediasphere-deploy
   cd ~/mediasphere-deploy
   ```

2. **Download deployment files:**
   ```bash
   # Copy docker-compose.production.yml and .env.production to this directory
   # Or create them manually using the provided content
   ```

3. **Configure environment:**
   ```bash
   cp .env.production .env
   # Edit .env file with your specific configuration
   nano .env
   ```

4. **Deploy the application:**
   ```bash
   sudo docker compose -f docker-compose.production.yml pull
   sudo docker compose -f docker-compose.production.yml up -d
   ```

5. **Check deployment status:**
   ```bash
   sudo docker compose -f docker-compose.production.yml ps
   sudo docker compose -f docker-compose.production.yml logs -f
   ```

## Available Services

- **Database:** PostgreSQL on port 5432
  - Connection: `postgresql://postgres:securepassword123@localhost:5432/mediasphere_db`
  
- **Backend API:** Spring Boot on port 8080
  - Health check: `http://localhost:8080/actuator/health`
  - API endpoints: `http://localhost:8080/api/...`

- **Frontend:** Next.js React app on port 3000
  - Application: `http://localhost:3000`
  - Uses Clerk for authentication
  - Connects to backend API internally

## Management Commands

### View logs:
```bash
sudo docker compose -f docker-compose.production.yml logs postgres
sudo docker compose -f docker-compose.production.yml logs backend
sudo docker compose -f docker-compose.production.yml logs frontend
```

### Restart services:
```bash
sudo docker compose -f docker-compose.production.yml restart
```

### Stop all services:
```bash
sudo docker compose -f docker-compose.production.yml down
```

### Update to latest images:
```bash
sudo docker compose -f docker-compose.production.yml pull
sudo docker compose -f docker-compose.production.yml up -d
```

### Backup database:
```bash
sudo docker compose -f docker-compose.production.yml exec postgres pg_dump -U postgres mediasphere_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Troubleshooting

### Check container health:
```bash
sudo docker compose -f docker-compose.production.yml ps
```

### Access database directly:
```bash
sudo docker compose -f docker-compose.production.yml exec postgres psql -U postgres -d mediasphere_db
```

### View application logs:
```bash
sudo docker compose -f docker-compose.production.yml logs backend --tail=100 -f
```

## Security Notes

1. Change default passwords in `.env` file
2. Consider using Docker secrets for production
3. Set up proper firewall rules
4. Use HTTPS in production with a reverse proxy (nginx/traefik)
5. Regular backup of the postgres_data volume

## VM Specific Configuration (Azure B2ts_v2)

- Memory optimized for 1 GiB RAM
- PostgreSQL configured for lightweight usage
- JVM heap limited to 75% of container memory
- Health checks configured for reliability
