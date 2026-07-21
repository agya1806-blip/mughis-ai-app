# Instalasi di iPhone (PWA)

## Langkah 1: Buka di Safari

1. Buka Safari di iPhone
2. Kunjungi URL Mughis AI (misal: `https://mughis-ai.vercel.app`)
3. Pastikan menggunakan **Safari**, bukan Chrome atau browser lain

## Langkah 2: Add to Home Screen

1. Tap ikon **Share** (kotak dengan panah atas) di toolbar bawah Safari
2. Scroll ke bawah dan tap **Add to Home Screen** (Tambahkan ke Layar Utama)
3. Nama akan otomatis: "Mughis AI"
4. Tap **Add** (kanan atas)

## Langkah 3: Buka sebagai App

1. Ikon Mughis AI akan muncul di Home Screen
2. Tap untuk membuka — akan terbuka tanpa browser UI (standalone mode)
3. Seperti native app!

## Yang Bisa Dilakukan

| Fitur | Status |
|---|---|
| Install ke Home Screen | ✅ |
| Bekerja offline (app shell) | ✅ |
| Push notifications | ⚠️ (via Background Sync nanti) |
| Kamera/Mic access | ✅ (untuk voice) |
| File download | ✅ |
| Full screen | ✅ |
| Safe area (notch) | ✅ |
| Orientation lock | ✅ (portrait) |

## Tips iPhone

1. **Battery Saver:** Dark mode sudah default, hemat baterai OLED
2. **Storage:** Data disimpan di localStorage, maks ~5MB
3. **Offline:** Service worker cache halaman utama, konten AI perlu koneksi
4. **Update:** Buka Safari → buka URL → PWA akan update otomatis
5. **Clear cache:** Settings → Safari → Clear History and Website Data

## Troubleshooting

**PWA tidak bisa install?**
- Pastikan iPhone iOS 12.5+
- Buka di Safari, bukan Chrome
- Cek koneksi internet

**Gambar tidak muncul?**
- Pollinations.ai mungkin butuh waktu (cold start ~5-10 detik)
- Coba refresh

**Video tidak jalan?**
- Video generation butuh Hugging Face token (gratis)
- Daftar di https://huggingface.co/join
- Buat token di https://huggingface.co/settings/tokens
- Masukkan di Settings → Penyedia AI
