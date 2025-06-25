# Docker Deployment to Azure VM - Complete Workflow Summary

## Project Overview
Successfully deployed a multi-service Dockerized Gantt Chart application (Spring Boot backend, React frontend, PostgreSQL database) to an Azure VM using Docker Hub images.

---

## 1. Azure VM Setup

### VM Creation Commands
```bash
# VM Details (from Azure Portal)
VM Name: gantt-vm
Public IP: 98.70.40.14
OS: Ubuntu 24.04 LTS
Size: Standard B2ts v2 (2 vCPUs, 1 GiB RAM)
Location: Central India (Zone 1)
```

### SSH Key Setup
```bash
# Generated SSH key pair in Azure
# Downloaded private key: gantt-vm_key.pem
chmod 600 ~/.ssh/gantt-vm_key.pem
```

### Initial VM Connection
```bash
ssh -i ~/.ssh/gantt-vm_key.pem abd-faiyaz-vm@98.70.40.14
```

---

## 2. VM Environment Setup

### Docker Installation
```bash
# Update package index
sudo apt update

# Install Docker
sudo apt install docker.io -y

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose -y
```

### Verify Installation
```bash
sudo docker --version
sudo docker compose version
```

---

## 3. Local Docker Image Preparation

### Directory Structure Created
```
docker/
├── backend/
│   ├── Dockerfile
│   └── application-docker.properties
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── nginx.main.conf
├── database/
│   ├── Dockerfile
│   └── init/
└── docker-compose.production.yml
└── .env.production
```

### Backend Dockerfile
```dockerfile
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY target/gantt_project_v1-0.0.1-SNAPSHOT.jar app.jar
COPY docker/backend/application-docker.properties /app/application-docker.properties
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=docker
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar --spring.config.location=/app/application-docker.properties"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY React_Frontend/package*.json ./
RUN npm ci --silent
COPY React_Frontend/src ./src
COPY React_Frontend/public ./public
ARG REACT_APP_API_URL=""
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/frontend/nginx.main.conf /etc/nginx/nginx.conf
# Security configurations...
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Database Dockerfile
```dockerfile
FROM postgres:15-alpine
COPY docker/database/init/ /docker-entrypoint-initdb.d/
COPY Gantt_project_v1/src/main/resources/insert_codes_gantt_db/ /docker-entrypoint-initdb.d/
EXPOSE 5432
```

---

## 4. Image Building and Pushing

### Build Commands
```bash
# Backend (from project root)
cd Gantt_project_v1
mvn clean package -DskipTests
cd ..
sudo docker build -f docker/backend/Dockerfile -t abdfaiyaz/gantt-backend:latest .

# Frontend (from project root)
sudo docker build --build-arg REACT_APP_API_URL=http://98.70.40.14 -f docker/frontend/Dockerfile -t abdfaiyaz/gantt-frontend:latest .

# Database (from project root)
sudo docker build -f docker/database/Dockerfile -t abdfaiyaz/gantt-database:latest .
```

### Push to Docker Hub
```bash
sudo docker push abdfaiyaz/gantt-backend:latest
sudo docker push abdfaiyaz/gantt-frontend:latest
sudo docker push abdfaiyaz/gantt-database:latest
```

---

## 5. VM Deployment Setup

### Transfer Files to VM
```bash
# Create deployment directory on VM
ssh -i ~/.ssh/gantt-vm_key.pem abd-faiyaz-vm@98.70.40.14 "mkdir -p /home/abd-faiyaz-vm/gantt-deployment"

# Transfer docker-compose file
scp -i ~/.ssh/gantt-vm_key.pem docker/docker-compose.production.yml abd-faiyaz-vm@98.70.40.14:/home/abd-faiyaz-vm/gantt-deployment/

# Transfer environment file
scp -i ~/.ssh/gantt-vm_key.pem docker/.env.production abd-faiyaz-vm@98.70.40.14:/home/abd-faiyaz-vm/gantt-deployment/
```

### Pull Images on VM
```bash
ssh -i ~/.ssh/gantt-vm_key.pem abd-faiyaz-vm@98.70.40.14 "cd /home/abd-faiyaz-vm/gantt-deployment && sudo docker pull abdfaiyaz/gantt-backend:latest && sudo docker pull abdfaiyaz/gantt-frontend:latest && sudo docker pull abdfaiyaz/gantt-database:latest"
```

### Deploy Stack
```bash
ssh -i ~/.ssh/gantt-vm_key.pem abd-faiyaz-vm@98.70.40.14 "cd /home/abd-faiyaz-vm/gantt-deployment && sudo docker compose -f docker-compose.production.yml --env-file .env.production up -d"
```

---

## 6. Database Data Population

### Manual Data Insertion
```bash
# Connect to database
ssh -i ~/.ssh/gantt-vm_key.pem abd-faiyaz-vm@98.70.40.14 "sudo docker exec gantt-postgres psql -U postgres -d gantt_project_db"

# Insert sample data
# Users
INSERT INTO users (user_id, username, email, password_hash, first_name, last_name, role, department, is_active, date_of_joining, salary, timezone, phone_number, created_at, updated_at) VALUES
(gen_random_uuid(), 'admin', 'admin@gantt.com', '$2a$10$dXJ3SW6G7P9wuK/UBrSDOOBJ.bBh8g8oy4NppG.fGD9GYCHS.j3n2', 'Admin', 'User', 'PROJECT_MANAGER', 'IT', true, '2024-01-01', 75000.0, 'UTC', '+1234567890', NOW(), NOW());

# Projects
INSERT INTO projects (project_name, project_description, start_date, end_date, status, priority) VALUES
('Gantt Project Management System', 'A comprehensive project management system', '2024-01-01', '2024-12-31', 'Active', 'High');

# Tasks
INSERT INTO tasks (task_id, title, description, start_date, due_date, status, priority, type, assignee_id, created_at, updated_at) VALUES
(gen_random_uuid(), 'Setup Development Environment', 'Configure development tools', '2024-06-01', '2024-06-05', 'COMPLETED', 'High', 'TASK', 'c7897223-2633-4268-b786-e65db8bb70cd', NOW(), NOW());
```

---

## 7. Major Errors Encountered and Fixes

### Error 1: Backend Configuration Missing
**Problem:** Backend couldn't find `application-docker.properties`
```
ERROR: Could not find application-docker.properties
```
**Fix:** 
- Updated backend Dockerfile to properly copy config file
- Modified `.dockerignore` to allow config files

### Error 2: Database Schema Validation Error
**Problem:** 
```
Schema-validation: missing table [tasks]
```
**Fix:** Changed Hibernate DDL mode from `validate` to `update` in `application-docker.properties`
```properties
spring.jpa.hibernate.ddl-auto=update
```

### Error 3: Frontend Container Restart Loop
**Problem:** Frontend container continuously restarting with exit code 1
```
CONTAINER ID   STATUS
9aed62978eaf   Restarting (1) 2 seconds ago
```
**Fix:** Invalid nginx configuration in `nginx.conf`
```bash
# BEFORE (invalid):
gzip_proxied expired no-cache no-store private must-revalidate no_last_modified no_etag auth;

# AFTER (fixed):
gzip_proxied expired no-cache no-store private no_last_modified no_etag auth;
```

### Error 4: Database User/Database Not Found
**Problem:** 
```
psql: FATAL: role "ganttuser" does not exist
psql: FATAL: database "gantt_db" does not exist
```
**Fix:** Used correct credentials from `.env.production`:
- Database: `gantt_project_db`
- User: `postgres`

### Error 5: Empty Database Tables
**Problem:** All tables existed but were empty (no sample data)
**Fix:** Manually inserted sample data using psql commands

---

## 8. Local Codebase Changes Made

### Backend Changes
1. **Application Properties** (`docker/backend/application-docker.properties`):
   ```properties
   spring.jpa.hibernate.ddl-auto=update  # Changed from 'validate'
   spring.datasource.url=jdbc:postgresql://postgres:5432/gantt_project_db
   ```

2. **Dockerfile** (`docker/backend/Dockerfile`):
   - Added proper config file copying
   - Set correct environment variables

3. **CORS Configuration** (`WebConfig.java`):
   ```java
   .allowedOrigins("http://localhost:3000")  # For local development
   # Frontend nginx handles production CORS
   ```

### Frontend Changes
1. **Nginx Configuration** (`docker/frontend/nginx.conf`):
   - Fixed invalid `gzip_proxied` directive
   - Added API proxy configuration for backend

2. **Build Configuration**:
   - Added `REACT_APP_API_URL` build argument for VM deployment

### Database Changes
1. **Initialization Scripts**:
   - Organized SQL files in proper execution order
   - Fixed foreign key dependencies

### Docker Configuration
1. **Docker Compose** (`docker-compose.production.yml`):
   - Added health checks for all services
   - Configured proper networking
   - Set up volume persistence

2. **Environment Variables** (`.env.production`):
   ```bash
   DB_NAME=gantt_project_db
   DB_USERNAME=postgres
   DB_PASSWORD=CHANGE_THIS_PASSWORD_IN_PRODUCTION
   FRONTEND_EXTERNAL_PORT=80
   ```

---

## 9. Final Verification Commands

### Check Container Status
```bash
ssh -i ~/.ssh/gantt-vm_key.pem abd-faiyaz-vm@98.70.40.14 "sudo docker ps"
```

### Check Application Logs
```bash
ssh -i ~/.ssh/gantt-vm_key.pem abd-faiyaz-vm@98.70.40.14 "sudo docker logs gantt-backend"
ssh -i ~/.ssh/gantt-vm_key.pem abd-faiyaz-vm@98.70.40.14 "sudo docker logs gantt-frontend"
ssh -i ~/.ssh/gantt-vm_key.pem abd-faiyaz-vm@98.70.40.14 "sudo docker logs gantt-postgres"
```

### Access Application
- Frontend: http://98.70.40.14
- Backend Health: http://98.70.40.14/health
- API Endpoints: http://98.70.40.14/api/tasks

---

## 10. Final Architecture

```
Azure VM (98.70.40.14)
├── gantt-frontend (nginx:80) → External Port 80
├── gantt-backend (spring-boot:8080) → Internal
├── gantt-postgres (postgresql:5432) → Internal
└── gantt_network (Docker network)
```

### Service Health Status
- ✅ **gantt-postgres**: Healthy
- ✅ **gantt-backend**: Healthy  
- ✅ **gantt-frontend**: Running and accessible

---

## Success Metrics
- All containers running without restart loops
- Frontend accessible on public IP
- Backend API responding through nginx proxy
- Database populated with sample data
- Full stack communication working
- Application fully functional for task management

**Deployment Status: ✅ SUCCESSFUL**
