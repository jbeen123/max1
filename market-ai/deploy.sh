#!/bin/bash
# Deploy script for Market-AI to Vercel
# Usage: ./deploy.sh [production|preview]

set -e

ENV=${1:-preview}
echo "🚀 Deploying Market-AI to Vercel ($ENV)..."

# Check for vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "🔑 Please login to Vercel:"
    vercel login
fi

# Build
echo "📦 Building..."
npm run build

# Deploy
echo "🚀 Deploying..."
if [ "$ENV" = "production" ]; then
    vercel --prod
else
    vercel
fi

echo "✅ Deploy complete!"
