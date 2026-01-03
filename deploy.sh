#!/bin/bash
# Deploy marlow.dev.br to Hostinger
# Usage: ./deploy.sh

set -e

REMOTE_USER="u163272241"
REMOTE_HOST="147.93.39.7"
REMOTE_PORT="65002"
REMOTE_PATH="~/domains/marlow.dev.br/public_html/"
LOCAL_PATH="/Users/marlow/projetos/marlow.dev.br/"

echo "🚀 Deploying marlow.dev.br to Hostinger..."

# Deploy files
rsync -avz --exclude='.DS_Store' --exclude='.claude' --exclude='*.pdf' --exclude='deploy.sh' --exclude='.git' --exclude='*.svg' \
  -e "ssh -p $REMOTE_PORT" \
  "$LOCAL_PATH" \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"

# Fix permissions via SFTP
echo "🔧 Setting file permissions..."
sftp -P $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST << 'EOF'
chmod 644 domains/marlow.dev.br/public_html/index.html
chmod 644 domains/marlow.dev.br/public_html/og-image.png
quit
EOF

echo "✅ Deployment complete!"
echo "🌐 Site live at: https://marlow.dev.br"
