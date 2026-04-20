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

Local template-based generation (no AI cost). 6 post types × 5 hook types:
- **Post Types:** 物件開箱, 降價急售, 知識教學, 人設生活, 成交喜報, 開發徵件
- **Hooks:** 無, 專業焦慮鉤, 知識佈道鉤, 利益誘惑鉤, 情感溫度鉤

## OpenAI Integration

API route at `/api/generate-copy` (currently unused by main flow). Set `OPENAI_API_KEY` in Replit Secrets to enable enhanced generation.

## State Persistence

Both Zustand stores use `persist` middleware with localStorage:
- `tobe-nexus-properties-v1` — property data
- `tobe-nexus-system-v1` — areas, subareas, copies, options
