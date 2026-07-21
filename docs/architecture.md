# Arsitektur Final Mughis AI

## Filosofi: Zero-Server Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    IPHONE (Safari PWA)                    │
│                                                          │
│  ┌──────────────────┐   ┌───────────────────────────┐    │
│  │   Service Worker  │   │    Next.js App (React)     │    │
│  │  ├─ Offline Cache │   │  ├─ Image Generator        │    │
│  │  ├─ Background Sync│   │  ├─ Video Generator        │    │
│  │  └─ Queue Manager │   │  ├─ AI Chat                │    │
│  └──────────────────┘   │  ├─ Voice TTS/STT           │    │
│                         │  └─ Gallery & History        │    │
│  ┌──────────────────┐   └───────────────────────────┘    │
│  │   localStorage    │                                    │
│  │  ├─ Images/Video  │   ┌───────────────────────────┐    │
│  │  ├─ API Keys      │   │    AI Providers (Browser)  │    │
│  │  ├─ Queue         │   │  ├─ Pollinations.ai (FREE) │    │
│  │  └─ Settings      │   │  ├─ HuggingFace Inference  │    │
│  └──────────────────┘   │  └─ Gemini API              │    │
│                         └───────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         │
         │ HTTP (no backend server needed)
         ▼
┌─────────────────────────────────────────────────────────┐
│              AI API Providers (Free Tier)                │
│  ├─ image.pollinations.ai                                │
│  ├─ api-inference.huggingface.co                         │
│  ├─ generativelanguage.googleapis.com                    │
└─────────────────────────────────────────────────────────┘
```

## Prinsip Desain

1. **100% Client-Side** — Tidak ada backend server. Semua kode berjalan di browser.
2. **No Login Required** — Langsung pakai, tanpa registrasi.
3. **PWA First** — Install ke Home Screen iPhone seperti native app.
4. **Offline Capable** — Service worker untuk cache dan background sync.
5. **Free API Only** — Hanya menggunakan API gratisan (Pollinations, HuggingFace Inference, Gemini).

## Struktur Direktori

```
mughis-ai/
├── apps/web/                 # Next.js PWA (satu-satunya aplikasi)
│   ├── public/
│   │   ├── manifest.json     # PWA manifest
│   │   ├── sw.js             # Service worker
│   │   └── icons/            # App icons (SVG)
│   └── src/
│       ├── app/              # Next.js App Router pages
│       │   ├── page.tsx      # Home
│       │   ├── image/        # Image generation
│       │   ├── video/        # Video generation
│       │   ├── chat/         # AI Chat
│       │   ├── voice/        # Voice TTS/STT
│       │   ├── gallery/      # History gallery
│       │   └── settings/     # Settings
│       ├── components/       # UI components
│       │   ├── nav.tsx       # Sidebar + MobileNav
│       │   ├── button.tsx
│       │   ├── card.tsx
│       │   ├── input.tsx
│       │   └── modal.tsx
│       └── lib/
│           ├── ai/           # AI service clients
│           │   ├── index.ts  # Exports & providers
│           │   ├── providers.ts
│           │   ├── image.ts  # Image generation
│           │   ├── video.ts  # Video generation
│           │   ├── chat.ts   # Chat service
│           │   └── voice.ts  # Voice TTS/STT
│           ├── storage.ts    # localStorage wrapper
│           ├── queue.ts      # Task queue
│           └── utils.ts      # Utilities
├── services/                 # Service documentation
│   ├── chat/README.md
│   ├── image/README.md
│   ├── video/README.md
│   └── voice/README.md
├── storage/README.md         # Storage strategy
├── docs/                     # Documentation
├── vercel.json               # Vercel deployment
├── wrangler.toml             # Cloudflare deployment
└── package.json              # Root package
```

## Dependency Graph

```
mughis-web (Next.js 14)
├── react / react-dom         # UI framework
├── lucide-react              # Icons (22KB gzip)
├── tailwindcss              # Styling (utility-first)
├── typescript               # Type safety
└── idb-keyval               # Optional: IndexedDB wrapper

NO DEPENDENCIES for:
├── Auth (removed)
├── State management (removed — React state is enough for single-user)
├── HTTP client (native fetch is sufficient)
├── Animation (CSS animations instead of framer-motion)
└── UI library (7 custom components instead of Radix)
```

## Data Flow

```
User Input → AI Service (browser) → API Provider → Response
     │                                                    │
     └── localStorage ←────── Result ──────────────────────┘
              │
              └── Gallery / History display
```

## Queue & Retry Flow

```
enqueue(task) → localStorage → process()
                                  │
                          handler(task)
                                  │
                    ┌─────────────┴─────────────┐
                    │                          │
               success                      failed
                    │                          │
            status=completed          retries < 3?
                                         │        │
                                      retry    status=failed
                                         │
                                   status=pending
```
