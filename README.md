# Gyzenn Community

Situs komunitas Minecraft Indonesia yang dibangun dengan Astro dan dirender sebagai situs statis. Gunakan Node.js 22.x sesuai `.nvmrc` dan konfigurasi Vercel.

## Menjalankan lokal

```sh
npm install
npm run dev
npm run build
npm run preview
npm run audit
```

`npm run audit` menjalankan pemeriksaan Playwright pada `http://localhost:4321`; jalankan server Astro terlebih dahulu (`npm run dev` atau `npm run preview`). Audit memeriksa overflow, gambar, target sentuh, error browser, tautan unduhan, filter katalog, tab, tautan detail, dan salin tautan. Di PowerShell dengan execution policy yang memblokir `npm.ps1`, gunakan `npm.cmd` dan `npx.cmd`.

## Struktur proyek

- `src/pages/`: Beranda, katalog, detail modpack dinamis, Zalith, Komunitas, Casda Network, 404, dan sitemap.
- `src/components/`: header, navigasi bawah, footer, kartu, placeholder cover, toast, dan tombol WhatsApp.
- `src/data/`: data JSON, tipe TypeScript, navigasi, serta helper untuk katalog dan gambar.
- `src/assets/img/`: cover dan gambar yang diproses Astro menjadi WebP responsif.
- `src/styles/`: token tema Crimson Red dan gaya dasar.
- `public/`: favicon dan berkas statis publik.
- `scripts/audit-redesign.mjs`: audit Playwright lintas viewport dan interaksi.

## Skema modpack

Sumber katalog adalah `src/data/modpacks.json`, dengan tipe di `src/data/types.ts`. Field yang dipakai: `id`, `type` (`modpack`, `shader`, `resourcepack`, atau `mod`), `name`, `displayTitle`, `edition`, `version`, `minecraft`, `loader`, `loaderVersion` (boleh bebas, mis. `Latest`), `categories` (termasuk kategori `RPG` dan `AUDIO`), `status`, `isNew`, `isRecommended`, `isArchived`, `badges`, `theme`, `image`, `imageAlt`, `description`, `note` (`type`, `text`), `features`, `credits`, `tips`, `downloads` (`label`, `url`, `host`, `type`), `additionalMods`, `resourcepacks`, `extraMods`, `extraModsNote`, `mods`, dan `ticker`. Field opsional yang tidak relevan untuk sebagian entri boleh tidak diisi; `image` dapat bernilai `null` dan `downloads` berisi tautan unduhan entri.

### Menambah modpack

Tambahkan satu entri dengan `id` unik ke `src/data/modpacks.json`, isi jenis, kategori, deskripsi, dan tautan unduhannya. Untuk cover asli, tambahkan gambar ke `src/assets/img/`, lalu set `image` ke `/assets/img/nama-file.webp` dan isi `imageAlt` dengan deskripsi gambar. Helper gambar menghubungkan nama berkas ke aset Astro; gambar yang tidak tersedia tetap menggunakan placeholder. Kategori akan tersedia pada filter katalog.

Entri `type: "mod"` muncul pada tab keempat **Mod** di `/modpacks/#mod` memakai `ModpackCard` yang sama, tetapi tidak dihitung sebagai modpack pada statistik beranda, daftar terbaru, atau filter kategori. `Download.host`/`type` mendukung `curseforge` dan `youtube`: tautan YouTube dirender sebagai tombol sekunder berikon play pada halaman detail, sementara tombol utama tetap mengunduh entri pertama.

### Memperbarui Zalith

Perbarui versi, developer/status, changelog, dan daftar APK pada `src/data/zalith.json`. Pertahankan URL rilis yang benar; beranda dan halaman Zalith membaca data yang sama.

## Deploy ke Vercel

Hubungkan repository ke Vercel dengan preset Astro, gunakan Node.js 22.x, perintah build `npm run build`, dan direktori output `dist`. Build menghasilkan situs statis.
