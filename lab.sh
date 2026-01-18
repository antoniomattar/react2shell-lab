#!/bin/bash
# CVE-2025-55182 (React2Shell) Lab - Quick Start Script
# 
# This script helps you quickly set up and test the lab environment

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${RED}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           CVE-2025-55182 (React2Shell) Lab                    ║"
echo "║                                                               ║"
echo "║  ⚠️  FOR AUTHORIZED SECURITY TESTING ONLY                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

function usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start       - Build and start the vulnerable environment"
    echo "  stop        - Stop all containers"
    echo "  test        - Run a quick exploit test"
    echo "  scan        - Scan the local instance for vulnerability"
    echo "  shell       - Get a shell in the attacker container"
    echo "  logs        - View container logs"
    echo "  clean       - Remove all containers and images"
    echo ""
}

function start_lab() {
    echo -e "${YELLOW}[*] Building and starting vulnerable environment...${NC}"
    docker-compose up --build -d
    
    echo -e "${YELLOW}[*] Waiting for application to start...${NC}"
    sleep 5
    
    # Check if app is running
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}[+] Vulnerable application is running at http://localhost:3000${NC}"
    else
        echo -e "${RED}[-] Application failed to start. Check logs with: docker-compose logs${NC}"
        exit 1
    fi
}

function stop_lab() {
    echo -e "${YELLOW}[*] Stopping containers...${NC}"
    docker-compose down
    echo -e "${GREEN}[+] Lab stopped${NC}"
}

function test_exploit() {
    echo -e "${YELLOW}[*] Testing exploit against local instance...${NC}"
    echo ""
    
    # Check if Python and requests are available
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}[-] Python3 not found. Please install Python3.${NC}"
        exit 1
    fi
    
    # Install requirements if needed
    pip3 install -q requests urllib3 2>/dev/null || true
    
    # Run the exploit
    python3 exploit/exploit.py http://localhost:3000 "id"
}

function scan_instance() {
    echo -e "${YELLOW}[*] Scanning local instance...${NC}"
    python3 exploit/scanner.py -u http://localhost:3000
}

function attacker_shell() {
    echo -e "${YELLOW}[*] Starting attacker container...${NC}"
    docker-compose --profile with-attacker up -d
    echo -e "${GREEN}[+] Connecting to attacker shell...${NC}"
    docker exec -it react2shell-attacker /bin/bash
}

function view_logs() {
    docker-compose logs -f
}

function clean_lab() {
    echo -e "${YELLOW}[*] Cleaning up lab environment...${NC}"
    docker-compose down --rmi all --volumes
    docker network rm react2shell-lab_vuln-network 2>/dev/null || true
    echo -e "${GREEN}[+] Cleanup complete${NC}"
}

# Main
case "${1:-}" in
    start)
        start_lab
        ;;
    stop)
        stop_lab
        ;;
    test)
        test_exploit
        ;;
    scan)
        scan_instance
        ;;
    shell)
        attacker_shell
        ;;
    logs)
        view_logs
        ;;
    clean)
        clean_lab
        ;;
    *)
        usage
        ;;
esac
