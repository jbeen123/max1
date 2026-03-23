# 🚀 Market-AI Deployment Guide

## Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/jbeen123/max1.git
cd max1/market-ai
npm install

# 2. Configure environment
cp .env.production.example .env.production
# Edit .env.production with your values

# 3. Setup database
./setup-db.sh "your_postgres_url"

# 4. Deploy to Vercel
./deploy.sh production
```

---

## 📋 Option A: Vercel (Recommended)

### Prerequisites
- Vercel account: https://vercel.com/signup
- PostgreSQL database: https://railway.app or https://supabase.com

### Steps

1. **Push to GitHub** (already done!)
   - Repo: https://github.com/jbeen123/max1

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import `jbeen123/max1`
   - Select the `market-ai` directory

3. **Environment Variables**
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=openssl rand -base64 32
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

4. **Deploy**
   - Click Deploy
   - Wait for build (2-3 minutes)
   - Done! 🎉

---

## 🐳 Option B: Docker

```bash
# Build
docker build -t market-ai .

# Run with env file
docker run -p 3000:3000 --env-file .env.production market-ai

# Or run with inline env
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="http://localhost:3000" \
  market-ai
```

---

## ☁️ Option C: Railway (Full Stack)

```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Add PostgreSQL
railway add --database

# Deploy
railway up
```

---

## 🔧 Option D: Self-Hosted (VPS)

```bash
# On your server
git clone https://github.com/jbeen123/max1.git
cd max1/market-ai
npm install
npm run build

# Setup environment
export DATABASE_URL="postgresql://..."
export NEXTAUTH_SECRET="..."
export NEXTAUTH_URL="https://yourdomain.com"

# Run with PM2
npm i -g pm2
pm2 start npm --name "market-ai" -- start

# Setup nginx reverse proxy + SSL
# ...
```

---

## 🗄️ Database Setup

### Option 1: Railway PostgreSQL
```bash
railway add --database
# Copy connection string from dashboard
```

### Option 2: Supabase
```bash
# Create project at https://supabase.com
# Get connection string from Settings → Database
```

### Option 3: Local PostgreSQL
```bash
# Ubuntu/Debian
sudo apt install postgresql
sudo -u postgres createdb market_ai

# Connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/market_ai"
```

---

## ✅ Post-Deploy Checklist

- [ ] Homepage loads
- [ ] Can sign up / log in
- [ ] Can create listing
- [ ] Admin can approve listing
- [ ] Search works
- [ ] Messages work
- [ ] Database persists data

---

## 🆘 Troubleshooting

### Build fails
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Database connection error
- Check `DATABASE_URL` format
- Ensure IP is allowlisted
- Try adding `?sslmode=require`

### Auth not working
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain

---

## 📊 Estimated Costs

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel | ✅ $0 | $20/mo |
| Railway DB | ✅ 5GB | $5/mo |
| Supabase | ✅ 500MB | $25/mo |
| **Total** | **$0** | **$20-50/mo** |

---

**Ready to launch? Pick Option A, B, C, or D above!** 🚀
