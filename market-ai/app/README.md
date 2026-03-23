# 📱 App Directory

Next.js App Router structure.

## Structure

### Routes (Pages)
Each folder represents a route:

| Folder | Route | Description |
|--------|-------|-------------|
| `admin/` | `/admin` | Admin dashboard |
| `compliance/` | `/compliance` | Compliance center |
| `contracts/` | `/contracts` | Contract management |
| `dashboard/` | `/dashboard` | User dashboard |
| `deal-room/` | `/deal-room` | Deal negotiations |
| `investors/` | `/investors` | Investor profiles |
| `land-scanner/` | `/land-scanner` | AI land scanner |
| `login/` | `/login` | Authentication |
| `matches/` | `/matches` | Property matches |
| `messages/` | `/messages` | Messaging |
| `notifications/` | `/notifications` | Notifications |
| `property/` | `/property/[id]` | Property details |
| `public-info/` | `/public-info` | Public info |
| `public-records/` | `/public-records` | Public records |
| `search/` | `/search` | Property search |
| `submit/` | `/submit` | Submit property |

### API Routes
Located in `api/` subdirectory:
- RESTful API endpoints
- Server-side logic
- Database operations

## Conventions
- Use `page.tsx` for route pages
- Use `layout.tsx` for nested layouts
- Use `loading.tsx` for loading states
- Use `error.tsx` for error boundaries
- Use `route.ts` for API endpoints
