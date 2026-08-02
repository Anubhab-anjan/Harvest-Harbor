#!/bin/bash

# Harvest Harbor - Amazon Linux EC2 Setup & Deployment Script
set -e

echo "=================================================="
echo "🌾 Harvest Harbor - Amazon Linux EC2 Setup"
echo "=================================================="

# Determine package manager (dnf for AL2023, yum for AL2)
if command -v dnf &> /dev/null; then
    PKG_MGR="dnf"
else
    PKG_MGR="yum"
fi

echo "--> Installing system packages via $PKG_MGR..."
sudo $PKG_MGR update -y
sudo $PKG_MGR install -y python3 python3-pip python3-devel gcc nginx git curl

# Ensure home directory permission allows Nginx worker to read static files
chmod 755 /home/ec2-user

# Determine project path
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Setup Python virtual environment for backend
echo "--> Setting up Python virtual environment..."
cd "$BACKEND_DIR"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# Setup Systemd Service for Gunicorn
echo "--> Creating Systemd Service for Flask Backend..."
USER_NAME=$(whoami)

sudo bash -c "cat <<EOF > /etc/systemd/system/harvest-harbor.service
[Unit]
Description=Harvest Harbor Flask ML REST API
After=network.target

[Service]
User=$USER_NAME
WorkingDirectory=$BACKEND_DIR
Environment=\"PATH=$BACKEND_DIR/venv/bin\"
ExecStart=$BACKEND_DIR/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF"

sudo systemctl daemon-reload
sudo systemctl restart harvest-harbor
sudo systemctl enable harvest-harbor

# Setup Nginx Configuration for Amazon Linux
echo "--> Configuring Nginx Reverse Proxy & Static Frontend..."

# Amazon Linux loads /etc/nginx/conf.d/*.conf
sudo bash -c "cat <<EOF > /etc/nginx/conf.d/harvest-harbor.conf
server {
    listen 80 default_server;
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

sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "=================================================="
echo "✅ Harvest Harbor successfully deployed on Amazon Linux!"
echo "Access your app at: http://$(curl -s ifconfig.me)"
echo "=================================================="
