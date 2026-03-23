# Market-AI MVP

A compliance-first marketplace for connecting land/real-estate sellers and buyers.

**Scope:** This is the minimal viable product — just listings, search, and messaging.

---

## ✅ MVP Features

### For Sellers
- [x] Create property listings with photos
- [x] View listing status (pending / active / archived)
- [x] Receive messages from interested buyers
- [x] Dashboard with stats and quick actions

### For Buyers
- [x] Browse/search listings by state, zoning, price
- [x] View property details with photos
- [x] Contact sellers via in-app messaging
- [x] Filter by price range and location

### For Admin
- [x] Approve/reject listings before they go live
- [x] View platform stats (users, listings, pending)
- [x] Simple moderation queue

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js |
| Styling | Tailwind CSS |

---

## 🗃️ Database Schema (6 tables)

```
User
├── id, email, name, role, profile fields
├── properties (seller's listings)
├── conversations (message threads)
├── notifications
└── messagesSent

Property
├── id, sellerId, title, description
├── location (state, county, city, zip)
├── details (price, acres, zoning, parcelId)
├── images (JSON array of URLs)
├── status (PENDING_REVIEW | ACTIVE | ARCHIVED)
└── conversations

Conversation
├── id, propertyId, participants
└── messages

ConversationParticipant
├── id, conversationId, userId

Message
├── id, conversationId, senderId, body, createdAt

Notification
├── id, userId, type, title, body, link, readAt
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Setup

```bash
# 1. Clone and install
cd market-ai
npm install

# 2. Environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET

# 3. Database setup
npx prisma generate
npx prisma migrate dev --name init

# 4. Seed sample data (optional)
node scripts/seed-realistic.js

# 5. Run dev server
npm run dev
```

App runs at `http://localhost:3000`

---

## 📁 Project Structure

```
market-ai/
├── app/
│   ├── admin/              # Admin dashboard (approve listings)
│   ├── api/
│   │   ├── admin/
│   │   │   ├── approve/    # POST approve listing
│   │   │   └── reject/     # POST reject listing
│   │   ├── auth/           # NextAuth routes
│   │   ├── conversations/  # Create/view conversations
│   │   └── properties/     # CRUD for listings
│   ├── dashboard/          # Seller dashboard
│   ├── login/              # Auth pages
│   ├── messages/           # Messaging UI
│   ├── property/[id]/      # Property detail page
│   ├── search/             # Browse listings
│   └── submit/             # Create listing form
├── components/
│   ├── AuthStatus.tsx
│   ├── NotificationBell.tsx
│   └── Providers.tsx
├── lib/
│   ├── auth.ts             # Auth helpers
│   ├── db.ts               # Database connection
│   └── messaging.ts        # Message helpers
├── prisma/
│   └── schema.prisma       # Database schema
└── scripts/
    └── seed-realistic.js   # Sample data
```

---

## 🔑 Environment Variables

```bash
# Required
DATABASE_URL="postgresql://user:pass@localhost:5432/marketai"
NEXTAUTH_SECRET="random-secret-string"
NEXTAUTH_URL="http://localhost:3000"

# Optional (for image uploads)
AWS_S3_BUCKET="your-bucket"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
```

---

## 🎯 What's NOT in MVP (Future Features)

| Feature | Status |
|---------|--------|
| AI Land Scanner | ❌ Cut |
| Automated matching | ❌ Cut |
| E-signatures | ❌ Cut |
| Payment processing | ❌ Cut |
| KYC automation | ❌ Cut |
| Queue approvals | ❌ Cut |
| Webhook signing | ❌ Cut |
| Complex admin RBAC | ❌ Cut |

**These will be added post-launch based on user feedback.**

---

## 📊 MVP Success Metrics

Before adding features, validate:

- [ ] 10+ real property listings
- [ ] 50+ registered users
- [ ] 5+ messages sent between buyers/sellers
- [ ] 1+ successful deal facilitated

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

### Railway

```bash
railway login
railway link
railway up
```

### Manual

```bash
npm run build
npm start
```

---

## 🐛 Troubleshooting

### Database connection errors
```bash
# Check connection string format
postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Test connection
npx prisma db pull
```

### Build errors
```bash
# Clear caches
rm -rf .next node_modules
npm install
npm run build
```

### Auth issues
- Make sure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Verify callback URLs in your auth provider

---

## 🤝 Contributing

This is a minimal codebase. Keep it that way:

1. **Keep changes small**
2. **Don't add dependencies** unless critical
3. **Test before PR** — `npm run build` must pass
4. **Document new features** in this README

---

## 📄 License

MIT License — see LICENSE file

---

<p align="center">
  Built for land investors, by land investors.
</p>
