# Market-AI MVP Deployment Checklist

Use this checklist to go from local dev to live site.

---

## Pre-Deployment

### 1. Code Preparation
- [ ] Run cleanup script: `./cleanup-mvp.sh`
- [ ] Replace files with MVP versions
- [ ] Remove console.logs from production code
- [ ] Add error handling to all API routes
- [ ] Test `npm run build` passes locally
- [ ] Verify no TypeScript errors
- [ ] Run `npm run lint` (if configured)

### 2. Database Setup
- [ ] Create production PostgreSQL database
  - [ ] Railway
  - [ ] Supabase
  - [ ] AWS RDS
  - [ ] Other provider
- [ ] Get database connection string
- [ ] Set `DATABASE_URL` in environment
- [ ] Run `npx prisma migrate deploy` (production migrations)
- [ ] Run seed script: `node scripts/seed-mvp.js`
- [ ] Verify tables created

### 3. Authentication Setup
- [ ] Generate secure `NEXTAUTH_SECRET`:
  ```bash
  openssl rand -base64 32
  ```
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Configure email provider (optional for MVP)
  - [ ] Resend
  - [ ] SendGrid
  - [ ] AWS SES
- [ ] OR: Stick to credential-based auth for MVP

### 4. Image Uploads (Optional)
- [ ] Create AWS S3 bucket
- [ ] Set bucket CORS policy
- [ ] Create IAM user with limited permissions
- [ ] Add env vars:
    - `AWS_S3_BUCKET`
    - `AWS_ACCESS_KEY_ID`
    - `AWS_SECRET_ACCESS_KEY`
    - `AWS_REGION`
- [ ] Test image upload

---

## Deployment Options

### Option A: Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Steps:**
- [ ] Connect GitHub repo to Vercel (or use CLI)
- [ ] Add environment variables in dashboard
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `.next`
- [ ] Add database connection string
- [ ] Deploy
- [ ] Verify custom domain (if using)

**Pros:**
- Free tier available
- Automatic HTTPS
- Fast global CDN
- Easy rollbacks

**Cons:**
- Serverless functions have cold starts
- Database needs to be external

---

### Option B: Railway (Full Stack)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

**Steps:**
- [ ] Create new project
- [ ] Add PostgreSQL database (Railway provides this)
- [ ] Add environment variables
- [ ] Deploy
- [ ] Set custom domain (optional)

**Pros:**
- Database + app in one place
- Good free tier
- Easy scaling

**Cons:**
- Less mature than Vercel
- Fewer edge locations

---

### Option C: Self-Hosted (VPS)

**Requirements:**
- [ ] VPS (DigitalOcean, Linode, AWS EC2, etc.)
- [ ] Domain name
- [ ] SSL certificate (Let's Encrypt)

**Setup:**
```bash
# On server
git clone <your-repo>
cd market-ai
npm install
npm run build

# Set up environment variables
# Edit .env file

# Run migrations
npx prisma migrate deploy

# Start with PM2
npm i -g pm2
pm2 start npm --name "market-ai" -- start

# Set up reverse proxy (nginx)
# Configure SSL
```

**Pros:**
- Full control
- No usage limits
- Cheaper at scale

**Cons:**
- More maintenance
- Security responsibility
- No automatic deploys

---

## Post-Deployment

### 1. Smoke Tests
- [ ] Homepage loads
- [ ] `/search` shows listings
- [ ] Can view property details
- [ ] Signup works
- [ ] Login works
- [ ] Can create listing
- [ ] Admin can approve listing
- [ ] Messages work
- [ ] Images display correctly
- [ ] Mobile responsive

### 2. Admin Setup
- [ ] Log in as admin
- [ ] Approve any pending listings
- [ ] Verify admin dashboard shows stats
- [ ] Test approve/reject buttons

### 3. Monitoring
- [ ] Set up error tracking (optional)
  - [ ] Sentry
  - [ ] LogRocket
- [ ] Set up uptime monitoring
  - [ ] UptimeRobot (free)
  - [ ] Pingdom
  - [ ] Better Uptime

### 4. Analytics (Optional)
- [ ] Add Google Analytics
- [ ] Or: Plausible (privacy-focused)
- [ ] Or: Fathom

---

## Launch Day

### Before Sharing
- [ ] Test all critical paths one more time
- [ ] Create admin account for yourself
- [ ] Seed 5-10 real-looking listings
- [ ] Add your own listing as a test
- [ ] Verify email notifications work (if using)
- [ ] Check mobile view

### Sharing Checklist
- [ ] Post on Twitter/X
- [ ] Share in relevant communities
  - [ ] Reddit (r/realestate, r/land)
  - [ ] Indie Hackers
  - [ ] Product Hunt (when ready)
  - [ ] Facebook groups
- [ ] Email friends/family
- [ ] Post on LinkedIn

---

## Common Issues

### Build Fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Fails
- Verify `DATABASE_URL` format
- Check if IP is allowlisted
- SSL mode issues: add `?sslmode=require`

### Auth Not Working
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches domain
- Look at browser console for errors

### Images Not Loading
- Check S3 CORS policy
- Verify env vars are set
- Check image URLs in database

### 500 Errors
- Check Vercel/Railway logs
- Look for Prisma connection issues
- Verify all env vars are set

---

## Cost Estimate (Monthly)

| Service | Free Tier | Paid (Starter) |
|---------|-----------|----------------|
| Vercel | $0 | $20 |
| Railway | $5 credit | $5+ |
| Supabase DB | 500MB | $25 |
| AWS RDS | None | $15+ |
| S3 (images) | 5GB | ~$1-5 |
| Domain | - | $10-15/yr |
| **Total** | **$0** | **$20-50** |

---

## Quick Reference

### Environment Variables
```bash
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://yourdomain.com"

# Optional (for uploads)
AWS_S3_BUCKET="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"

# Optional (for emails)
EMAIL_SERVER="..."
EMAIL_FROM="..."
```

### Useful Commands
```bash
# Local dev
npm run dev

# Build
npm run build

# Database
npx prisma migrate dev      # Development
npx prisma migrate deploy   # Production
npx prisma studio           # Database UI

# Seed
node scripts/seed-mvp.js
```

---

## Support

Stuck? Check:
1. README-MVP.md for local setup
2. This checklist for deployment steps
3. Error logs in your hosting dashboard
4. Prisma docs for database issues
5. NextAuth docs for auth issues

---

**Good luck! Ship it! 🚀**
