# 🔨 Scripts Directory

Automation, cron jobs, and utility scripts.

## Scripts

| Script | Purpose |
|--------|---------|
| `cron-phase12.sh` | Phase 1-2 cron tasks |
| `cron-phase21-expire-approvals.sh` | Expire old approvals |
| `seed-phase24.js` | Seed database (Phase 24) |
| `seed-realistic.js` | Seed with realistic data |
| `worker-phase14.sh` | Background worker |

## Usage

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

Run manually:
```bash
./scripts/cron-phase12.sh
node scripts/seed-realistic.js
```

## Cron Setup

Add to crontab:
```bash
# Phase 1-2 tasks every 5 minutes
*/5 * * * * cd /path/to/market-ai && ./scripts/cron-phase12.sh

# Expire approvals daily at midnight
0 0 * * * cd /path/to/market-ai && ./scripts/cron-phase21-expire-approvals.sh
```
