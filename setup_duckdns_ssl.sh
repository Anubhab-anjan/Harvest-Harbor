#!/bin/bash

# Harvest Harbor - DuckDNS & SSL Setup Script for Amazon Linux EC2
set -e

if [ -z "$1" ]; then
    echo "Usage: ./setup_duckdns_ssl.sh <YOUR_DUCKDNS_DOMAIN> <YOUR_EMAIL>"
    echo "Example: ./setup_duckdns_ssl.sh harvest-harbor.duckdns.org user@gmail.com"
    exit 1
fi

DOMAIN="$1"
EMAIL="${2:-admin@harvest-harbor.com}"

echo "=================================================="
echo "🔒 Setting up SSL (HTTPS) for $DOMAIN..."
echo "=================================================="

# 1. Determine package manager
if command -v dnf &> /dev/null; then
    PKG_MGR="dnf"
else
    PKG_MGR="yum"
fi

# 2. Install Certbot & Nginx plugin
echo "--> Installing Certbot..."
sudo $PKG_MGR install --allowerasing -y certbot python3-certbot-nginx

# 3. Update server_name in Nginx config
echo "--> Updating Nginx domain to $DOMAIN..."
sudo sed -i "s/server_name _;/server_name $DOMAIN;/" /etc/nginx/conf.d/harvest-harbor.conf
sudo sed -i "s/server_name .*\.duckdns\.org;/server_name $DOMAIN;/" /etc/nginx/conf.d/harvest-harbor.conf

sudo nginx -t
sudo systemctl reload nginx

# 4. Obtain SSL Certificate via Certbot
echo "--> Requesting Let's Encrypt SSL Certificate..."
sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect

echo "=================================================="
echo "✅ HTTPS successfully enabled!"
echo "Access your app at: https://$DOMAIN"
echo "=================================================="
