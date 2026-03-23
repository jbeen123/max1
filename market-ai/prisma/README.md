# 🗄️ Prisma Directory

Database schema and migrations.

## Files

| File | Purpose |
|------|---------|
| `schema.prisma` | Database schema definition |
| `migrations/` | Migration files |

## Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Deploy migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Seed database
npx prisma db seed
```

## Schema Conventions
- Use PascalCase for model names
- Use camelCase for field names
- Add comments for complex fields
- Index frequently queried fields
