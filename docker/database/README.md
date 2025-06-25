# MediaSphere Database - Azure VM Deployment Guide

## Phase 1: Database Containerization - Complete ✅

This document outlines the completed database containerization setup for MediaSphere, optimized for Azure VM deployment.

## Architecture Overview

```
Azure VM (B2ts_v2 - 2 vCPUs, 1 GiB RAM) - gantt-vm
├── Docker Engine
├── MediaSphere Database Container
│   ├── PostgreSQL 16 (Alpine)
│   ├── Custom Configuration
│   ├── Initialization Scripts
│   ├── Health Checks
│   └── Management Tools
└── Persistent Volumes
    ├── Database Data (postgres-data)
    ├── Backup Storage (postgres_backup)
    └── Log Files (postgres_logs)
```

## Components Created

### 1. Database Container (`/docker/database/`)
- **Dockerfile**: Custom PostgreSQL 16 Alpine container
- **PostgreSQL Configuration**: Optimized for Azure VM resources
- **Initialization Scripts**: Schema setup, sample data, performance optimization
- **Health Checks**: Comprehensive database health monitoring

### 2. Management Scripts (`/docker/database/scripts/`)
- **backup.sh**: Automated database backup with compression
- **restore.sh**: Database restoration from backup files
- **health-check.sh**: Container health verification
- **db-manager.sh**: Comprehensive database management tool

### 3. Configuration Files
- **.env**: Environment variables for all configurations
- **docker-compose.yml**: Complete orchestration configuration
- **postgresql.conf**: Performance-optimized PostgreSQL settings for 1 GiB VM

### 4. Database Schema (Exact match with Table_creation_init.sql)
- **Users**: OAuth integration with Clerk, role-based access
- **Media Types**: Movies, TV Series, Books, Anime, Manga, Games
- **Clubs**: Community spaces for each media type
- **Threads & Comments**: Discussion system
- **Events**: Club events and activities
- **Notifications**: Real-time user notifications
- **AI Analyses**: AI-powered content analysis storage

## Azure VM Deployment Features

### Resource Optimization (B2ts_v2 Specific)
- **Memory**: 128MB shared buffers, 512MB effective cache
- **Connections**: Up to 50 concurrent connections
- **Storage**: Persistent volumes with backup rotation
- **Logging**: Development-level logging with rotation

### Security Features
- **Authentication**: SCRAM-SHA-256 password hashing
- **Network**: host_network for simplified deployment
- **Access Control**: Role-based database permissions
- **SSL Ready**: Configuration for TLS/SSL termination

### Monitoring & Maintenance
- **Health Checks**: 30-second interval health monitoring
- **Backup Strategy**: Daily automated backups with 7-day retention
- **Resource Limits**: Memory (768M) and CPU (1.0) constraints for stability

## Deployment Commands

### Initial Setup
```bash
# Navigate to database directory
cd /home/abd_faiyaz/mediasphere_40_percent/docker/database

# Start the database
./db-manager.sh start

# Check status
./db-manager.sh status
```

### Management Operations
```bash
# Create backup
./db-manager.sh backup production_backup

# View logs
./db-manager.sh logs

# Connect to database
./db-manager.sh connect

# Restart database
./db-manager.sh restart
```

### Azure VM Specific Considerations

#### Network Configuration
- **Internal Port**: 5432 (container)
- **External Port**: 5432 (Azure VM)
- **Network**: host_network (simplified deployment)

#### Storage Configuration
- **Data Volume**: postgres-data
- **Backup Volume**: postgres_backup  
- **Log Volume**: postgres_logs

#### Resource Allocation (B2ts_v2)
- **Memory Limit**: 768M maximum, 256M reserved
- **CPU Limit**: 1.0 CPU, 0.5 CPU reserved
- **Disk I/O**: Optimized for Azure VM SSD storage

## Next Phase Integration

The database is now ready for **Phase 2: Backend Containerization**. The backend will connect using:

```yaml
Database Connection:
  Host: postgres (internal network)
  Database: db_408
  User: postgres
  Password: 1234
  Network: host_network
```

## Monitoring & Alerts

### Health Check Endpoints
- Container health check every 30 seconds
- Database connectivity verification
- Table existence validation

### Performance Monitoring
- Built-in database statistics functions
- Table size monitoring
- Connection count tracking
- Query performance logging

## Backup & Recovery

### Automated Backups
- Daily backup schedule
- 7-day retention policy
- Compressed backup files
- Azure VM disk backup integration

### Manual Operations
```bash
# Create named backup
./db-manager.sh backup "pre_migration_backup"

# Restore from backup
./db-manager.sh restore "backup_file.sql.gz"

# List available backups
sudo docker compose exec postgres ls -la /var/lib/postgresql/backup/
```

## Security Considerations

### Production Deployment
1. **Change default passwords** in `.env` file (currently using development password)
2. **Enable SSL/TLS** in postgresql.conf
3. **Configure firewall rules** on Azure VM
4. **Set up Azure backup** for persistent volumes
5. **Implement log monitoring** and alerting

### Access Control
- Database user: postgres (development setup)
- Network isolation within Docker host_network
- Backend proxy access through Spring Boot application

---

**Status**: ✅ Phase 1 Complete - Ready for Phase 2 (Backend Containerization)
**Next Step**: Backend Spring Boot application containerization
**Azure VM Compatibility**: Verified for B2ts_v2 (2 vCPUs, 1 GiB memory)
**Database**: db_408 with exact schema from Table_creation_init.sql
