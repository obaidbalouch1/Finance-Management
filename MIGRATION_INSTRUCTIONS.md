# Database Migration Instructions

## Run this migration to add the SimpleSpending table

After the Vercel deployment completes, you need to run the Prisma migration:

### Option 1: Using Vercel CLI (Recommended)
```bash
vercel env pull .env.local
npx prisma migrate dev --name add_simple_spending
npx prisma generate
npx prisma db push
```

### Option 2: Direct migration on production
```bash
npx prisma db push
```

This will add the `simple_spendings` table to your database.

## What was added:

1. **New Database Model**: `SimpleSpending` table
   - Stores quick spending entries
   - No account selection required
   - Tracks: description, amount, currency, date

2. **New API Routes**:
   - GET `/api/spending` - Fetch spendings by month/year
   - POST `/api/spending` - Create new spending
   - PATCH `/api/spending/[id]` - Update spending
   - DELETE `/api/spending/[id]` - Delete spending

3. **New Page**: `/spending`
   - Simple spending tracker interface
   - Monthly view with dropdown filters
   - Add, edit, delete spendings
   - Shows monthly total

4. **Navigation**: Added "Simple Spending" to sidebar menu
