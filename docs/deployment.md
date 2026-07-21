# Deployment Guide

## 1. Vercel (Free Tier)

**Biaya:** $0 (Hobby plan — 100GB bandwidth, 6000 build minutes/month)

### Langkah:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy dari root mughis-ai
cd mughis-ai
vercel --prod
```

### Konfigurasi:
- Framework: Next.js
- Root Directory: `apps/web`
- Build Command: `cd apps/web && npx next build`
- Output: `.next` (untuk Vercel serverless) atau `out/` (static)

### Vercel.json (already provided):
```json
{
  "framework": "nextjs",
  "buildCommand": "cd apps/web && npx next build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "cd apps/web && npm install"
}
```

---

## 2. Cloudflare Pages (Free Tier)

**Biaya:** $0 (Unlimited requests, 500 builds/month, 1GB storage)

### Langkah:
```bash
# Install Wrangler CLI
npm i -g wrangler

# Login
wrangler login

# Deploy
wrangler pages deploy apps/web/out --branch main
```

### Atau via Dashboard:
1. Login ke Cloudflare Dashboard
2. Pages → Create a project
3. Connect GitHub repo
4. Build settings:
   - Build command: `cd apps/web && npm install && npm run build`
   - Build output: `apps/web/out`
5. Deploy

### wrangler.toml (already provided):
```toml
name = "mughis-ai"
compatibility_date = "2024-12-01"
pages_build_output_dir = "apps/web/out"
```

---

## 3. HuggingFace Spaces (Free Tier)

**Biaya:** $0 (CPU Basic — 2 vCPU, 16GB RAM, 50GB storage)

### Langkah:
1. Login ke https://huggingface.co
2. New Space → Static HTML
3. Upload `apps/web/out/` contents
4. Space akan aktif di `https://username-mughis-ai.hf.space`

### Atau via CLI:
```bash
# Build static export
cd apps/web && npm run build

# Deploy to HF Space
git remote add space https://huggingface.co/spaces/username/mughis-ai
git add -f out/
git commit -m "deploy"
git push space main
```

---

## 4. Alternative: GitHub Pages (Free)

```bash
cd apps/web
npm run build
# out/ folder akan berisi static files
# Push ke gh-pages branch
npx gh-pages -d out
```

---

## URL Structure After Deployment

| Platform | URL |
|---|---|
| Vercel | `https://mughis-ai.vercel.app` |
| Cloudflare | `https://mughis-ai.pages.dev` |
| HuggingFace | `https://username-mughis-ai.hf.space` |
| GitHub Pages | `https://username.github.io/mughis-ai` |

---

## PWA Registration

After deployment, register the service worker by adding this to any page:

```html
<script>
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
</script>
```
