# Ledger — Personal Finance Tracker

A ledger-inspired personal finance tracker with authentication, built with
Next.js, TypeScript, Tailwind CSS, Recharts, and Supabase (auth + database).

## Features

- Email/password sign up and login (Supabase Auth)
- Each user only sees their own transactions (Row Level Security)
- Add income and expense entries (amount, category, date, note)
- Dashboard with Balance / Income / Expenses summary cards
- Category breakdown donut chart
- Recent entries list with delete
- Sign out

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In your project, go to **SQL Editor** → **New query**
3. Paste the contents of `supabase/schema.sql` and click **Run**
   (this creates the `transactions` table and its security policies)
4. Go to **Settings → API** and copy your **Project URL** and **anon public** key

### 3. Add environment variables

Create a file named `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run it

```bash
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`. Click
"Create one" to sign up.

**Note:** by default, Supabase requires email confirmation before a new
account can sign in. Check your inbox (or spam folder) for the confirmation
email after signing up. You can turn this off for testing in Supabase under
**Authentication → Providers → Email → Confirm email**.

## Deploying to Vercel

1. Push this project to GitHub
2. Import it in Vercel (New Project → Import Repository)
3. In the Vercel project's **Settings → Environment Variables**, add the same
   two variables from your `.env.local`
4. Deploy

## Design

"Digital Ledger" theme — deep ink navy background with a subtle ruled-line
texture (like ledger paper), brass-gold accent for income, muted slate-blue
for expenses. Space Grotesk for headings, IBM Plex Mono for all amounts
(tabular figures, like a real ledger), Inter for body text.

## Project structure

```
src/
├── app/
│   ├── actions.ts         # Server actions: login, signup, logout
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── layout.tsx
│   ├── page.tsx            # Dashboard (server component, checks auth)
│   └── globals.css
├── components/
│   ├── Dashboard.tsx        # Client component with the ledger UI
│   ├── SummaryCard.tsx
│   ├── TransactionForm.tsx
│   ├── TransactionList.tsx
│   └── CategoryChart.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser Supabase client
│   │   ├── server.ts        # Server Supabase client
│   │   └── middleware.ts    # Session refresh + route protection
│   ├── types.ts
│   └── useTransactions.ts   # Supabase-backed data hook
├── middleware.ts
└── supabase/
    └── schema.sql           # Database table + Row Level Security policies
```
