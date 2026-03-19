# MeDashboard — Project Status Report

*Generated: March 2026*

---

## Stack

| Layer       | Technology                         | Version  |
|-------------|------------------------------------|----------|
| Framework   | Next.js (App Router, Turbopack)    | 16.1.6   |
| UI Library  | React                              | 19.2.3   |
| Language    | TypeScript                         | ^5       |
| Styling     | Tailwind CSS v4 (`@import`)        | ^4       |
| Backend     | Supabase SSR (`@supabase/ssr`)     | ^0.8.0   |
| Rich Text   | TipTap (StarterKit + Placeholder)  | ^3.20.0  |
| Deploy      | Vercel (auto-deploy from `main`)   | —        |

---

## Modules

### 📝 Notes

- ✅ Full CRUD — create, read, update, delete
- ✅ Pin/unpin notes (sorted pinned-first)
- ✅ Rich text editing with TipTap (headings, bold, italic, lists, code blocks)
- ✅ Client-side search and filter (`NoteListClient`)
- ✅ `NoteCard` with inline actions (edit, delete, pin)
- ✅ Server Component page with Client Component interactivity
- ✅ `maybeSingle()` fix on `getNoteById` — no console errors on deleted notes

### 💰 Finances

- ✅ Full transaction CRUD — create, edit, delete
- ✅ Category-based filtering with type-aware dropdown (income vs expense)
- ✅ Payment method tracking (cash, debit, credit, transfer, card)
- ✅ Monthly summary view (income, expenses, net balance)
- ✅ `TransactionRow` with edit/delete inline actions
- ✅ Responsive header — stacks on mobile, side-by-side on desktop
- ✅ **Debts module** — DebtCard with progress bar, amount breakdown, mark-as-paid, delete
- ✅ **New debt form** — modal with title, amount, monthly payment, installments, due date, notes
- ✅ Financial config table (balance, credit, currency)

### 📅 Calendar

- ✅ Full event CRUD — create, edit, delete
- ✅ Temporal grouping: Today (green dot), Upcoming (blue), Past (gray, dimmed)
- ✅ Event types and color-coded indicators
- ✅ Google Calendar sync fields (prepared for future integration)
- ✅ All-day event support
- ✅ Responsive header — stacks on mobile

### 🎬 Videos

- ✅ YouTube channel follow/unfollow system
- ✅ Video sync via YouTube Data API v3
- ✅ Client-side filtering by channel, pagination (12 per page, load more)
- ✅ Watch/unwatch toggle, pin videos
- ✅ "New" badge on unwatched videos
- ✅ Thumbnail display with `next/image`
- ✅ Initial fetch reduced from 100 to 50 for mobile performance

### 🔔 Notifications

- ✅ On-demand aggregation — no dedicated DB table
- ✅ **3 notification sources:**
  - `youtube_videos` where `is_notified = false` (grouped by channel, channel `notify_new = true`)
  - `calendar_events` within the next 48 hours
  - `debts` where `status = 'active'` and `next_due_date` within 7 days
- ✅ Live badge on Navbar bell icon (red count indicator)
- ✅ Unread/read visual states (red dot, dimmed text)
- ✅ "Mark all as read" button (marks all videos as `is_notified = true`)
- ✅ Click-to-mark-read on individual video notifications
- ✅ Relative timestamps (Just now, 3h ago, Yesterday, 5 days ago)
- ✅ React `cache()` deduplication — single query set per request

### 🏠 Home

- ✅ **Desktop:** 4 stat cards (Notes, Balance, Events, Unwatched Videos) — configurable visibility
- ✅ **Desktop:** Recent Notes, Upcoming Events, Recent Transactions sections
- ✅ **Mobile:** 2×2 quick-access grid (Notes, Finances, Calendar, Videos)
- ✅ **Mobile:** Activity carousel — horizontal swipeable feed of recent notes, transactions, events
- ✅ Time-based greeting (Buenos días / Buenas tardes / Buenas noches)
- ✅ Profile-aware display name (profile > Google OAuth > email prefix)
- ✅ Parallel data fetching via `Promise.all()` for all modules
- ✅ Footer with GitHub link

### ⚙️ Settings

- ✅ Profile editing — display name, avatar URL (with image compression)
- ✅ Google OAuth metadata display (email, Google avatar fallback)
- ✅ Widget visibility toggles — stat cards and home sections
- ✅ Notification preferences toggles — calendar, videos, finances, notes
- ✅ All preferences stored in `user_preferences` JSONB columns
- ✅ Upsert pattern — creates row on first save, updates on subsequent

---

## Architecture Highlights

### Server vs Client Components

| Pattern                  | Usage                                              |
|--------------------------|----------------------------------------------------|
| Server Components        | All `page.tsx` files — fetch data, render HTML      |
| Client Components        | Forms, modals, interactive cards, sidebar, carousel |
| `"use client"` boundary  | Only added when `useState`, `useEffect`, `onClick`, or browser APIs are needed |

### Data Fetching Strategy

- **Parallel fetching** — `Promise.all()` in every page that needs multiple data sources
- **React `cache()`** — `getNotifications()` wrapped in `cache()` to deduplicate across Navbar + Notifications page (3 queries instead of 6)
- **Server-side data layer** — `lib/data/*.ts` functions abstract Supabase queries from pages
- **Server Actions** — `lib/actions/*.ts` for all mutations (`"use server"` directive)

### Mobile-First Approach

- Default styles target mobile, `sm:` and `lg:` breakpoints add desktop enhancements
- `overflow-x: hidden` on `body` to prevent horizontal scroll
- `min-w-0` on key flex containers to prevent overflow
- Touch-friendly action buttons (always visible, not hover-only)
- Scrollable modals with `max-h-[90vh] overflow-y-auto`
- Sidebar: overlay on mobile, fixed on desktop

### Auth Strategy

- Supabase Auth with Google OAuth provider
- Session management via `@supabase/ssr` middleware (`proxy.ts`)
- Row Level Security (RLS) enabled on all tables
- Server-side client uses cookies-based auth
- Client-side client uses browser session

---

## Database

### Public Schema — Tables

| Table                | Status | UI Module     | Description                              |
|----------------------|--------|---------------|------------------------------------------|
| `notes`              | ✅ Active | Notes       | Rich text notes with pin support         |
| `transactions`       | ✅ Active | Finances    | Income/expense records with categories   |
| `categories`         | ✅ Active | Finances    | Transaction category definitions         |
| `financial_config`   | ✅ Active | Finances    | User financial settings (balance, etc.)  |
| `debts`              | ✅ Active | Finances    | Loans, installments, credit card debt    |
| `calendar_events`    | ✅ Active | Calendar    | Events with Google Calendar sync support |
| `youtube_channels`   | ✅ Active | Videos      | Followed YouTube channels                |
| `youtube_videos`     | ✅ Active | Videos      | Cached video metadata + thumbnails       |
| `user_profiles`      | ✅ Active | Settings    | Display name, avatar URL                 |
| `user_preferences`   | ✅ Active | Settings    | JSONB: widget visibility, notification prefs |

### Views

| View               | Status     | Description                                    |
|--------------------|------------|------------------------------------------------|
| `monthly_summary`  | ✅ Active  | Aggregated income/expenses/balance per month   |

### Security Fixes Applied

- ✅ `SECURITY INVOKER` on `monthly_summary` view — respects RLS of calling user
- ✅ `search_path` set on all functions to prevent schema injection
- ✅ `VACUUM ANALYZE` run on all tables after bulk data loads
- ✅ B-tree indexes on frequently queried columns

---

## Performance Optimizations Applied

| Optimization                                  | Impact                                       |
|-----------------------------------------------|----------------------------------------------|
| React `cache()` on `getNotifications()`       | 3 Supabase queries per request instead of 6  |
| Videos initial fetch reduced 100 → 50         | ~50% less data on `/videos` page load        |
| `Promise.all()` parallel fetching on all pages | Eliminates sequential waterfall queries      |
| `overflow-x: hidden` + `min-w-0`             | No horizontal scrolling on any device        |
| Client-side pagination (12 per page)          | Only render visible cards, load more on demand|
| `VACUUM ANALYZE` on Supabase tables           | Updated query planner statistics             |
| B-tree indexes on `transaction_date`, etc.    | Faster index scans for common queries        |

---

## Known Pending Items

- 🔲 **Videos lazy loading** — thumbnails load eagerly; could benefit from intersection observer
- 🔲 **Activity carousel active dot** — dot indicators are static; could track scroll position
- 🔲 **PWA support** — service worker, manifest, offline mode
- 🔲 **Onboarding tutorial** — guided walkthrough for first-time users
- 🔲 **Minesweeper mini-game** — easter egg / break feature
- 🔲 **Google Calendar sync** — schema is ready, sync logic pending
- 🔲 **Debt installment payment tracking** — individual installment recording
- 🔲 **Note categories/tags** — organization beyond pin/unpin

---

## Recent Commits Summary

| Hash      | Type | Description                                                          |
|-----------|------|----------------------------------------------------------------------|
| `c7e9722` | feat | Debts module UI — cards with progress bar, create, mark paid, delete |
| `7f69802` | perf | Reduce initial video fetch from 100 to 50                           |
| `05c7a5b` | feat | Mobile activity carousel in Home — notes, transactions, events      |
| `cf1914f` | perf | Deduplicate `getNotifications` with React `cache()`                  |
| `7f67cee` | feat | Notifications — unread dots, mark as read, timestamps, spacing      |
| `871d466` | feat | Notifications page with live badge — videos, calendar, debts        |
| `d2c5e55` | fix  | Mobile layout overflows and touch interactions                       |
| `cf04be5` | fix  | `maybeSingle` in `getNoteById` — no errors on deleted notes          |
| `d02a211` | feat | Dashboard home with module summaries and footer                      |
| `aeb1b56` | feat | Videos CRUD with YouTube API, channel follow, watch/pin              |
| `ef1ef93` | feat | Finances CRUD with server actions                                    |
| `84b0128` | feat | Google OAuth, proxy, RLS on all tables                               |
| `4cf0b0e` | feat | Notes CRUD with server actions                                       |
| `296d693` | feat | Typed data layer — all pages connected to Supabase                   |
