#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# One-time nginx setup for OCI Oracle Linux instances (mocktest-dev & nifty)
# Run as: bash setup-nginx.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "==> Installing nginx..."
sudo dnf install -y nginx

echo "==> Creating web root and setting ownership..."
sudo mkdir -p /var/www/html/mocktest-web
sudo chown -R opc:opc /var/www/html/mocktest-web

echo "==> Writing nginx config..."
sudo tee /etc/nginx/conf.d/mocktest-web.conf > /dev/null << 'EOF'
server {
    listen 80 default_server;
    server_name _;

    root /var/www/html/mocktest-web;
    index index.html;

    # SPA fallback — all routes serve index.html so React Router handles them
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy /api/* to the local FastAPI backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # Cache static assets aggressively (Vite hashes filenames)
    location ~* \.(js|css|woff2?|png|svg|ico|webp|json)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo "==> Removing default nginx config (if exists)..."
sudo rm -f /etc/nginx/conf.d/default.conf /etc/nginx/sites-enabled/default 2>/dev/null || true

echo "==> Opening firewall ports 80 and 443..."
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

echo "==> Enabling and starting nginx..."
sudo systemctl enable nginx
sudo systemctl start nginx

echo "==> Testing nginx config..."
sudo nginx -t

echo ""
echo "Done! nginx is serving /var/www/html/mocktest-web on port 80."
echo "Deploy your first build by pushing to the dev or main branch."
EOF

# Make script non-executable note: run with bash setup-nginx.sh
