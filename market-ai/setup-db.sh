#!/bin/bash
# Database setup script for Market-AI
# Usage: ./setup-db.sh "postgresql://user:pass@host:5432/market_ai"

set -e

DATABASE_URL=${1:-$DATABASE_URL}

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not provided"
    echo "Usage: ./setup-db.sh 'postgresql://user:pass@host:5432/market_ai'"
    exit 1
fi

echo "🗄️ Setting up database..."

# Set temp DATABASE_URL for commands
export DATABASE_URL

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🔄 Running migrations..."
npx prisma migrate deploy

# Seed data (optional)
read -p "🌱 Seed sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    node scripts/seed-mvp.js
fi

echo "✅ Database setup complete!"
