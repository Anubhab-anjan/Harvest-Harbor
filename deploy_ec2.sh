#!/bin/bash

# Harvest Harbor - Automatic EC2 Setup & Deployment Script
set -e

echo "=================================================="
echo "🌾 Harvest Harbor - AWS EC2 Setup & Deployment"
echo "=================================================="

# Update and install system dependencies
echo "--> Updating Ubuntu packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv nginx git curl

# Setup Python virtual environment for backend
echo "--> Setting up Python environment..."
cd ~/Harvest-Harbor-main/backend || cd ~/harvest-harbor/backend || cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# Setup Systemd Service for Gunicorn
echo "--> Creating Systemd Service for Flask Backend..."
PROJECT_DIR=$(pwd)
USER_NAME=$(whoami)

sudo bash -c "cat <<EOF > /etc/systemd/system/harvest-harbor.service
[Unit]
Description=Harvest Harbor Flask ML REST API
After=network.target

[Service]
User=$USER_NAME
WorkingDirectory=$PROJECT_DIR
Environment=\"PATH=$PROJECT_DIR/venv/bin\"
ExecStart=$PROJECT_DIR/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF"

sudo systemctl daemon-reload
sudo systemctl restart harvest-harbor
sudo systemctl enable harvest-harbor

# Setup Nginx Configuration
echo "--> Configuring Nginx Reverse Proxy & Static Frontend..."
FRONTEND_DIR=$(dirname "$PROJECT_DIR")/frontend

sudo bash -c "cat <<EOF > /etc/nginx/sites-available/harvest-harbor
server {
    listen 80;
    server_name _;

    location / {
        root $FRONTEND_DIR;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        client_max_body_size 10M;
    }
}
EOF"

# Enable site & restart Nginx
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/harvest-harbor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "=================================================="
echo "✅ Harvest Harbor successfully deployed on AWS EC2!"
echo "Access your app at: http://$(curl -s ifconfig.me)"
echo "=================================================="
