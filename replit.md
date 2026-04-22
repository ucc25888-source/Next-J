# TOBE-Nexus | AI 成交戰略系統

A Next.js 15 real estate automation system with AI-powered Facebook sales copywriting.

## Architecture

**Stack:** Next.js 15 App Router, Tailwind CSS v4, TypeScript, Zustand  
**Monorepo:** pnpm workspace at `artifacts/tobe-nexus/`  
**Workflow:** "TOBE-Nexus" → `pnpm --filter @workspace/tobe-nexus run dev` (port 3000)

## Brand System

- **Background:** Deep Titanium Gray `#2C2C2C` (`titanium-800`)
- **Accent:** Aurora Blue `#00E5FF` (`aurora-500`)
- **Text:** Glacier Silver `#E2E8F0` (`glacier-200`)
- No green or gold anywhere

## Routes

| Path | Description |
|------|-------------|
| `/` | Dashboard with real property stats and recent listings |
| `/properties` | Property list (card grid, search, delete) |
| `/properties/new` | Add new property form |
| `/properties/[id]` | Edit existing property |
| `/generate/[id]` | AI copywriting for a specific property |
| `/ai-copy` | Browse all properties to select for copywriting |
| `/settings` | System settings (OpenAI API key info) |

## Key Files

```
artifacts/tobe-nexus/src/
├── types/index.ts              # Property, Area, Copy, PostType, HookType types
├── store/
│   ├── usePropertyStore.ts     # Zustand (persist) — CRUD for properties
│   └── useSystemStore.ts       # Zustand (persist) — areas, subareas, options
├── utils/
│   ├── ai.ts                   # generateCopywriting() — local template engine
│   ├── copywritingTemplates.ts # fallbackHooks per post type (6 categories)
│   ├── image.ts                # compressImage(), downloadBase64Image()
│   └── cn.ts                   # tailwind-merge utility
├── components/
│   ├── Sidebar.tsx             # Nav with active state detection
│   ├── PageHeader.tsx          # Reusable header
│   ├── PropertyForm.tsx        # Full add/edit form (client component)
│   └── CopywritingPage.tsx     # PostType/HookType selector + FB preview
└── app/
    ├── layout.tsx
    ├── globals.css             # Tailwind v4 @theme with brand colors
    ├── page.tsx                # Dashboard
    ├── properties/page.tsx     # Property list
    ├── properties/new/page.tsx
    ├── properties/[id]/page.tsx
    ├── generate/[id]/page.tsx  # Copywriting for specific property
    ├── ai-copy/page.tsx        # Browse properties to copy
    └── settings/page.tsx
```

## Copywriting System

**AI-powered** via `/api/generate-fb` (gpt-5.2 via Replit AI Integrations). 6 post types × 5 hook types:
- **Post Types:** 物件開箱, 降價急售, 知識教學, 人設生活, 成交喜報, 開發徵件
- **Hooks:** 無, 專業焦慮鉤, 知識佈道鉤, 利益誘惑鉤, 情感溫度鉤
- **Inputs:** 貼文類型, HOOK開場白, 地點名稱（可覆寫）, 精華亮點（textarea）
- **Output:** AI streams main copy → appends random human slogan (30 options in `data/humanSlogans.ts`) → appends fixed contact footer (0925-997779 / LINE)
- **System prompt:** 珍選好福邸 brand format with 📍💰📏🏠 info block, ✅ highlights, 🎯 target buyer, and 4 hashtags
- **Quota:** tracked in PostgreSQL `clients` table; also reflected in client-side Zustand store

## OpenAI Integration

- **Primary:** `/api/generate-fb` — gpt-5.2 + streaming, uses `OPENAI_API_KEY` (user's own key, direct OpenAI API)
- **Legacy:** `/api/generate-copy` — gpt-4o-mini, uses `OPENAI_API_KEY` secret

## Client Accounts

| client_id | login_token | plan | quota | description |
|-----------|-------------|------|-------|-------------|
| A0001 | A0001-2026 | basic | 50 | test account |
| A1001 | A1001-2026 | professional | 200 | 福哥/杜美珍 花蓮房產顧問（21筆真實案件已匯入） |
| ADMIN | TOBE-ADMIN-2026 | admin | 99999 | 管理員 |

## Chrome Auto-translate Fix

`<html>` has `translate="no"` + `className="notranslate"` + `suppressHydrationWarning`.
`<body>` has `suppressHydrationWarning`. Sidebar uses `translate="no"` on `<aside>`.
All English text removed from Sidebar (was causing Chrome to trigger translation on zh-TW page).

## State Persistence

Zustand stores use localStorage only (no persist middleware):
- `StoreHydrator.tsx` — loads counters from localStorage key `tobe-nexus-counters-v1`
- `DataProvider.tsx` — fetches properties and client info from API on mount
