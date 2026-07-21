# Maintenance Jangka Panjang

## Monthly Checklist

- [ ] Cek Vercel/Cloudflare usage dashboard (bandwidth, build minutes)
- [ ] Uji coba semua fitur (image, video, chat, voice)
- [ ] Check Pollinations.ai status (https://status.pollinations.ai)
- [ ] Update dependencies jika ada security patch
- [ ] Backup data dari Settings → Ekspor Data

## Cara Tetap Gratis

### 1. Vercel Free Tier (batasan)

| Limit | Vercel Free |
|---|---|
| Bandwidth | 100 GB/bln |
| Build minutes | 6,000 menit/bln |
| Serverless functions | 100 GB-jam/bln |
| Team members | 1 |

**Tips tetap gratis:**
- Static export (`output: "export"`) — zero serverless function usage
- Bandwidth 100GB cukup untuk personal use (1000-2000 image loads/bulan)
- Build ~2 menit, 6000 menit/bln = 3000 builds/bln (lebih dari cukup)

### 2. Cloudflare Pages (lebih ringan)

| Limit | Cloudflare Free |
|---|---|
| Requests | Unlimited |
| Bandwidth | Unlimited |
| Build minutes | 500 menit/bln |
| Storage | 1 GB |

**Keunggulan:** Tidak ada batasan bandwidth. Build lebih jarang (~5-10/bln).

### 3. AI API Free Tiers

| Provider | Limit | Cara | API Key |
|---|---|---|---|
| Pollinations.ai | Unlimited | Direct browser fetch | None needed |
| HuggingFace Inference | 30k tokens/bln* | Inference API | Yes (free) |
| Gemini API | 60 req/min | REST API | Yes (free) |

\*HuggingFace rate limit per model varies. Cold start ~20s untuk model tidak populer.

**Strategi:**
- Default: Pollinations.ai untuk gambar (gratis, tanpa key)
- Video & STT: HuggingFace (butuh key, tapi gratis)
- Chat: Gemini API (gratis 60 req/menit)
- Simpan semua API key di localStorage iPhone

### 4. Biaya Operasional Bulanan

| Item | Biaya | Notes |
|---|---|---|
| Vercel Hosting | $0 | Static export, no serverless |
| Domain (optional) | $0-10/thn | Gunakan subdomain .vercel.app gratis |
| AI APIs | $0 | Semua free tier |
| Total | **$0/bln** | |

## Update & Upgrade Path

### Minor Update (bug fix / fitur baru)
```bash
cd apps/web
npm install          # update dependencies
# edit kode
npm run build        # test build
git add . && git commit -m "update"
git push             # auto-deploy ke Vercel/Cloudflare
```

### Major Update (framework upgrade)
```bash
npm install next@latest react@latest react-dom@latest
# fix breaking changes
npm run build
git push
```

## Backup Strategy

1. **Data ekspor** — Settings → Ekspor Data (simpan file JSON)
2. **GitHub** — Semua kode di repo (history lengkap)
3. **iPhone local** — Data aman di localStorage selama tidak clear Safari data

## Monitoring

- Vercel Dashboard: https://vercel.com/dashboard
- Cloudflare Dashboard: https://dash.cloudflare.com
- GitHub: Commit history & releases

## Jika Akun Gratis Habis (Worst Case)

1. Pindah hosting: Vercel → Cloudflare Pages (100% gratis, unlimited bandwidth)
2. Pindah AI provider: Tambahkan backend sendiri (e.g., Python FastAPI gratis di Railway)
3. Export data dulu sebelum migration
