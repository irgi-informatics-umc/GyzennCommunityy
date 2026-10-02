# Gyzenn Community Modpack Hub

Situs ini adalah pusat modpack resmi Gyzenn Community, dibangun menggunakan [Astro](https://astro.build/).

## Struktur Folder

- `src/` - Berisi source code Astro (komponen, halaman, layout, dan gaya).
- `public/` - Berisi aset statis (gambar, JSON data, favicon, script JS).
- `_legacy/` - Berisi file monolith versi sebelumnya.
- `scripts/` - Berisi skrip otomatisasi dan audit (di dalam `scripts/audit/`).

## Cara Menjalankan Lokal

Pastikan Anda menggunakan Node.js versi 22.x.

```bash
npm install
npm run dev      # Menjalankan server lokal
npm run build    # Membangun file statis ke /dist
npm run preview  # Melihat hasil build
```

## Menambah/Mengubah Modpack

Modpack data dibaca dari file `public/assets/js/modpacks.json`.

**Penjelasan Field Data Modpack:**
- `id`: String unik untuk modpack (huruf kecil, dipisah tanda hubung).
- `name`: Nama modpack yang ditampilkan.
- `displayTitle`: Judul utama pada kartu modpack.
- `version`: Versi modpack (misal: "V3", "V7").
- `category`: Kategori utama modpack (misal: "FPS BOOST", "SURVIVAL").
- `minecraft`: Versi Minecraft (misal: "1.21.1").
- `loader`: Nama modloader (misal: "Fabric").
- `fabricLoader`: Versi Fabric Loader.
- `status`: Status ketersediaan ("RELEASED", "DEV", dll).
- `badges`: Array lencana string tambahan.
- `image`: Nama file gambar cover di `public/assets/img/`.
- `imageAlt`: Teks alternatif untuk gambar cover.
- `description`: Deskripsi singkat modpack.
- `downloads`: Array objek link unduhan. Tiap objek memiliki `type` ("MRPACK", "ZIP") dan `url` (link langsung).
- `mods`: Array nama mod unggulan yang disertakan.

## Update Versi Zalith

Untuk memperbarui data Zalith Client, edit file `public/assets/js/zalith.json`. Data ini digunakan untuk menampilkan spesifikasi dan link unduhan terbaru di halaman Zalith.

## Deploy ke Vercel

Proyek ini telah dikonfigurasi untuk Vercel.
- **Framework Preset**: Astro
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: 22.x
