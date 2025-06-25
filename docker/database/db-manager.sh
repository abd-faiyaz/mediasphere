#!/bin/bash
# MediaSphere Database Manager
# Comprehensive database management script for Azure VM deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
ENV_FILE="$SCRIPT_DIR/.env"

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! sudo docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
}

start_database() {
    log_info "Starting MediaSphere database..."
    
    # Check if already running
    if sudo docker compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        log_warning "Database is already running"
        return 0
    fi
    
    # Start the database
    sudo docker compose -f "$COMPOSE_FILE" up -d
    
    # Wait for health check
    log_info "Waiting for database to be healthy..."
    for i in {1..30}; do
        if sudo docker compose -f "$COMPOSE_FILE" ps | grep -q "healthy"; then
            log_success "Database started successfully!"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    log_error "Database failed to start within timeout"
    show_logs
    exit 1
}

stop_database() {
    log_info "Stopping MediaSphere database..."
    sudo docker compose -f "$COMPOSE_FILE" down
    log_success "Database stopped successfully!"
}

restart_database() {
    log_info "Restarting MediaSphere database..."
    stop_database
    sleep 2
    start_database
}

show_status() {
    log_info "Database Status:"
    sudo docker compose -f "$COMPOSE_FILE" ps
    
    if sudo docker compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        echo ""
        log_info "Database Health Check:"
        sudo docker compose -f "$COMPOSE_FILE" exec postgres /usr/local/bin/health-check || true
        
        echo ""
        log_info "Database Statistics:"
        sudo docker compose -f "$COMPOSE_FILE" exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1;" || true
    fi
}

show_logs() {
    log_info "Showing database logs..."
    sudo docker compose -f "$COMPOSE_FILE" logs --tail=50 -f
}

backup_database() {
    local backup_name="${1:-auto_backup_$(date +%Y%m%d_%H%M%S)}"
    
    log_info "Creating database backup: $backup_name"
    sudo docker compose -f "$COMPOSE_FILE" exec postgres /usr/local/bin/backup-db "$backup_name"
    log_success "Backup completed!"
}

restore_database() {
    if [ -z "$1" ]; then
        log_error "Usage: $0 restore <backup_file>"
        log_info "Available backups:"
        sudo docker compose -f "$COMPOSE_FILE" exec postgres ls -la /var/lib/postgresql/backup/
        exit 1
    fi
    
    local backup_file="$1"
    log_warning "This will restore database from: $backup_file"
    log_warning "All current data will be lost!"
    
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log_info "Restore cancelled"
        exit 0
    fi
    
    log_info "Restoring database from backup..."
    sudo docker compose -f "$COMPOSE_FILE" exec postgres /usr/local/bin/restore-db "$backup_file"
    log_success "Restore completed!"
}

connect_database() {
    log_info "Connecting to database..."
    sudo docker compose -f "$COMPOSE_FILE" exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
}

clean_all() {
    log_warning "This will remove all database containers, volumes, and data!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log_info "Clean cancelled"
        exit 0
    fi
    
    log_info "Stopping and removing all database components..."
    sudo docker compose -f "$COMPOSE_FILE" down -v --remove-orphans
    
    # Remove images
    sudo docker compose -f "$COMPOSE_FILE" down --rmi all 2>/dev/null || true
    
    log_success "All database components removed!"
}

show_help() {
    echo "MediaSphere Database Manager"
    echo "Usage: $0 <command> [arguments]"
    echo ""
    echo "Commands:"
    echo "  start                Start the database"
    echo "  stop                 Stop the database"
    echo "  restart              Restart the database"
    echo "  status               Show database status and health"
    echo "  logs                 Show database logs (follow mode)"
    echo "  backup [name]        Create a database backup"
    echo "  restore <file>       Restore database from backup"
    echo "  connect              Connect to database with psql"
    echo "  clean                Remove all database components"
    echo "  help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 backup my_backup"
    echo "  $0 restore my_backup_20231225_120000.sql.gz"
    echo "  $0 status"
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        start)
            start_database
            ;;
        stop)
            stop_database
            ;;
        restart)
            restart_database
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        backup)
            backup_database "$2"
            ;;
        restore)
            restore_database "$2"
            ;;
        connect)
            connect_database
            ;;
        clean)
            clean_all
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
